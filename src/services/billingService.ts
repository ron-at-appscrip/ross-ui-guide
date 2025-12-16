import { supabase } from '@/integrations/supabase/client';
import { TimeEntry, TimeEntryStatus, Invoice, Payment, BillingAnalytics, InvoiceStatus, PaymentStatus } from '@/types/billing';
import { Matter } from '@/types/matter';
import { Client } from '@/types/client';
import { MatterService } from './matterService';
import { ClientService } from './clientService';

// Extended interfaces for enhanced functionality
export interface ReviewWorkflow {
  id: string;
  timeEntryId: string;
  reviewerId: string;
  reviewerName: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  comments: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface PaymentReminder {
  id: string;
  invoiceId: string;
  type: 'initial' | 'follow_up' | 'final' | 'collections';
  sentAt: string;
  daysOverdue: number;
  response?: 'paid' | 'dispute' | 'no_response';
}

export interface CollectionActivity {
  id: string;
  invoiceId: string;
  activityType: 'reminder_sent' | 'call_made' | 'letter_sent' | 'payment_plan' | 'write_off';
  description: string;
  assignedTo: string;
  dueDate: string;
  completedAt?: string;
  outcome?: string;
}

export interface ClientPaymentProfile {
  clientId: string;
  clientName: string;
  averagePaymentDays: number;
  paymentReliability: 'excellent' | 'good' | 'fair' | 'poor';
  totalInvoiced: number;
  totalPaid: number;
  currentBalance: number;
  creditLimit: number;
  paymentMethod: 'check' | 'wire' | 'credit_card' | 'ach';
  lastPaymentDate: string;
}

export class BillingService {
  // Time Entry Management
  static async createTimeEntry(entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<TimeEntry> {
    // Validate matter and client exist
    const matter = await MatterService.getMatter(entry.matterId);
    if (!matter) {
      throw new Error('Invalid matter ID');
    }

    // Auto-populate from matter data if not provided
    const timeEntry: TimeEntry = {
      id: Date.now().toString(),
      ...entry,
      matterTitle: entry.matterTitle || matter.title,
      clientId: entry.clientId || matter.clientId,
      clientName: entry.clientName || matter.clientName,
      rate: entry.rate || matter.billingPreference.hourlyRate || 350,
      amount: entry.hours * (entry.rate || matter.billingPreference.hourlyRate || 350),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // In production, this would save to Supabase
    const savedEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    savedEntries.push(timeEntry);
    localStorage.setItem('timeEntries', JSON.stringify(savedEntries));

    return timeEntry;
  }

  static async getTimeEntries(filters?: {
    matterId?: string;
    clientId?: string;
    status?: TimeEntryStatus;
    dateRange?: { start: string; end: string };
  }): Promise<TimeEntry[]> {
    // In production, this would query Supabase with filters
    const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    
    let filtered = entries;
    if (filters?.matterId) {
      filtered = filtered.filter((e: TimeEntry) => e.matterId === filters.matterId);
    }
    if (filters?.clientId) {
      filtered = filtered.filter((e: TimeEntry) => e.clientId === filters.clientId);
    }
    if (filters?.status) {
      filtered = filtered.filter((e: TimeEntry) => e.status === filters.status);
    }
    if (filters?.dateRange) {
      filtered = filtered.filter((e: TimeEntry) => 
        e.date >= filters.dateRange!.start && e.date <= filters.dateRange!.end
      );
    }

    return filtered;
  }

  static async updateTimeEntry(id: string, updates: Partial<TimeEntry>): Promise<TimeEntry> {
    const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    const index = entries.findIndex((e: TimeEntry) => e.id === id);
    
    if (index === -1) {
      throw new Error('Time entry not found');
    }

    entries[index] = {
      ...entries[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem('timeEntries', JSON.stringify(entries));
    return entries[index];
  }

  static async deleteTimeEntry(id: string): Promise<void> {
    const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    const filtered = entries.filter((e: TimeEntry) => e.id !== id);
    localStorage.setItem('timeEntries', JSON.stringify(filtered));
  }

  // Matter-specific billing helpers
  static async getMattersForTimeEntry(): Promise<Array<{
    id: string;
    title: string;
    clientName: string;
    practiceArea: string;
    hourlyRate?: number;
    status: string;
  }>> {
    const matters = await MatterService.getMatters();
    
    return matters
      .filter(m => m.status === 'active')
      .map(m => ({
        id: m.id,
        title: m.title,
        clientName: m.clientName,
        practiceArea: m.practiceArea,
        hourlyRate: m.billingPreference?.hourlyRate,
        status: m.status
      }));
  }

  // Client-specific billing helpers
  static async getClientBillingInfo(clientId: string): Promise<{
    totalBilled: number;
    totalPaid: number;
    outstandingBalance: number;
    recentTimeEntries: TimeEntry[];
  }> {
    const client = await ClientService.getClient(clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    const timeEntries = await this.getTimeEntries({ clientId });
    const totalBilled = timeEntries
      .filter(e => e.billable)
      .reduce((sum, e) => sum + e.amount, 0);
    
    // Mock paid amount (in production, calculate from payments)
    const totalPaid = totalBilled * 0.7;
    const outstandingBalance = totalBilled - totalPaid;

    return {
      totalBilled,
      totalPaid,
      outstandingBalance,
      recentTimeEntries: timeEntries.slice(-5)
    };
  }

  // Document-related time tracking
  static async createDocumentTimeEntry(
    documentId: string,
    matterId: string,
    description: string,
    hours: number,
    activityType: 'document_review' | 'document_drafting' | 'document_revision'
  ): Promise<TimeEntry> {
    const matter = await MatterService.getMatter(matterId);
    if (!matter) {
      throw new Error('Invalid matter ID');
    }

    return this.createTimeEntry({
      matterId,
      matterTitle: matter.title,
      clientId: matter.clientId,
      clientName: matter.clientName,
      description: `${description} (Document: ${documentId})`,
      hours,
      rate: matter.billingPreference?.hourlyRate || 350,
      amount: hours * (matter.billingPreference?.hourlyRate || 350),
      date: new Date().toISOString().split('T')[0],
      status: 'draft',
      billable: true,
      activityType,
      tags: ['document-work', activityType]
    });
  }

  // Communication-related time tracking
  static async createCommunicationTimeEntry(
    communicationType: 'email' | 'call' | 'meeting',
    matterId: string,
    duration: number,
    description: string
  ): Promise<TimeEntry> {
    const matter = await MatterService.getMatter(matterId);
    if (!matter) {
      throw new Error('Invalid matter ID');
    }

    const activityTypeMap = {
      email: 'correspondence',
      call: 'phone_call',
      meeting: 'client_meeting'
    };

    return this.createTimeEntry({
      matterId,
      matterTitle: matter.title,
      clientId: matter.clientId,
      clientName: matter.clientName,
      description,
      hours: duration / 60, // Convert minutes to hours
      rate: matter.billingPreference?.hourlyRate || 350,
      amount: (duration / 60) * (matter.billingPreference?.hourlyRate || 350),
      date: new Date().toISOString().split('T')[0],
      status: 'draft',
      billable: true,
      activityType: activityTypeMap[communicationType],
      tags: [communicationType, 'communication']
    });
  }

  // Analytics
  static async getBillingAnalytics(dateRange?: { start: string; end: string }): Promise<BillingAnalytics> {
    const timeEntries = await this.getTimeEntries(dateRange ? { dateRange } : undefined);
    
    const totalBilled = timeEntries
      .filter(e => e.billable && e.status !== 'draft')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const totalHours = timeEntries.reduce((sum, e) => sum + e.hours, 0);
    const billableHours = timeEntries.filter(e => e.billable).reduce((sum, e) => sum + e.hours, 0);
    
    const realizationRate = totalHours > 0 ? (billableHours / totalHours) * 100 : 0;
    const utilizationRate = 85; // Mock - would calculate from capacity
    
    // Group by client for profitability
    const clientGroups = timeEntries.reduce((acc, entry) => {
      if (!acc[entry.clientId]) {
        acc[entry.clientId] = {
          clientId: entry.clientId,
          clientName: entry.clientName,
          revenue: 0,
          hours: 0
        };
      }
      if (entry.billable) {
        acc[entry.clientId].revenue += entry.amount;
        acc[entry.clientId].hours += entry.hours;
      }
      return acc;
    }, {} as Record<string, any>);

    const profitabilityByClient = Object.values(clientGroups).map((client: any) => ({
      clientId: client.clientId,
      clientName: client.clientName,
      revenue: client.revenue,
      profit: client.revenue * 0.6, // Mock 60% profit margin
      margin: 60
    }));

    // Mock monthly revenue data
    const revenueByMonth = [
      { month: '2024-01', revenue: 125000, forecast: 130000 },
      { month: '2024-02', revenue: 142000, forecast: 140000 },
      { month: '2024-03', revenue: 138000, forecast: 145000 }
    ];

    return {
      realizationRate,
      utilizationRate,
      totalBilled,
      totalCollected: totalBilled * 0.85, // Mock 85% collection rate
      outstandingAmount: totalBilled * 0.15,
      averageCollectionTime: 42, // days
      profitabilityByClient,
      revenueByMonth
    };
  }

  // Recent entries for suggestions
  static async getRecentTimeEntries(limit: number = 5): Promise<TimeEntry[]> {
    const entries = await this.getTimeEntries();
    return entries
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  // Unsubmitted entries
  static async getUnsubmittedEntries(): Promise<TimeEntry[]> {
    return this.getTimeEntries({ status: 'draft' });
  }

  // Submit time entries
  static async submitTimeEntries(entryIds: string[]): Promise<void> {
    for (const id of entryIds) {
      await this.updateTimeEntry(id, { status: 'submitted' });
    }
  }

  // Generate mock time entries for testing
  static async generateMockTimeEntries(): Promise<void> {
    const mockEntries: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>[] = [
      // Client: Acme Corporation
      {
        matterId: 'matter-001',
        matterTitle: 'Acme Corp Contract Review',
        clientId: 'client-001',
        clientName: 'Acme Corporation',
        description: 'Review and analysis of vendor service agreement',
        hours: 3.5,
        rate: 350,
        amount: 1225,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'submitted',
        billable: true,
        activityType: 'document_review',
        tags: ['contract', 'review']
      },
      {
        matterId: 'matter-001',
        matterTitle: 'Acme Corp Contract Review',
        clientId: 'client-001',
        clientName: 'Acme Corporation',
        description: 'Client meeting to discuss contract terms and negotiation strategy',
        hours: 1.5,
        rate: 350,
        amount: 525,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'submitted',
        billable: true,
        activityType: 'client_meeting',
        tags: ['meeting', 'strategy']
      },
      {
        matterId: 'matter-001',
        matterTitle: 'Acme Corp Contract Review',
        clientId: 'client-001',
        clientName: 'Acme Corporation',
        description: 'Draft amendment to section 5.2 regarding payment terms',
        hours: 2.0,
        rate: 350,
        amount: 700,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'submitted',
        billable: true,
        activityType: 'document_drafting',
        tags: ['drafting', 'amendment']
      },
      
      // Client: TechStart Inc
      {
        matterId: 'matter-002',
        matterTitle: 'TechStart Trademark Registration',
        clientId: 'client-002',
        clientName: 'TechStart Inc',
        description: 'Trademark search and clearance analysis',
        hours: 4.0,
        rate: 425,
        amount: 1700,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'submitted',
        billable: true,
        activityType: 'legal_research',
        tags: ['trademark', 'research']
      },
      {
        matterId: 'matter-002',
        matterTitle: 'TechStart Trademark Registration',
        clientId: 'client-002',
        clientName: 'TechStart Inc',
        description: 'Prepare and file trademark application with USPTO',
        hours: 2.5,
        rate: 425,
        amount: 1062.50,
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'submitted',
        billable: true,
        activityType: 'filing',
        tags: ['trademark', 'filing']
      },
      
      // Client: Green Energy Solutions
      {
        matterId: 'matter-003',
        matterTitle: 'Green Energy M&A Due Diligence',
        clientId: 'client-003',
        clientName: 'Green Energy Solutions',
        description: 'Review of target company environmental compliance documents',
        hours: 6.0,
        rate: 475,
        amount: 2850,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'submitted',
        billable: true,
        activityType: 'due_diligence',
        tags: ['m&a', 'compliance']
      },
      {
        matterId: 'matter-003',
        matterTitle: 'Green Energy M&A Due Diligence',
        clientId: 'client-003',
        clientName: 'Green Energy Solutions',
        description: 'Conference call with client to discuss preliminary findings',
        hours: 1.0,
        rate: 475,
        amount: 475,
        date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'submitted',
        billable: true,
        activityType: 'phone_call',
        tags: ['call', 'update']
      },
      {
        matterId: 'matter-003',
        matterTitle: 'Green Energy M&A Due Diligence',
        clientId: 'client-003',
        clientName: 'Green Energy Solutions',
        description: 'Draft due diligence report executive summary',
        hours: 3.5,
        rate: 475,
        amount: 1662.50,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'submitted',
        billable: true,
        activityType: 'document_drafting',
        tags: ['report', 'summary']
      },
      
      // Some draft entries (not yet submitted)
      {
        matterId: 'matter-001',
        matterTitle: 'Acme Corp Contract Review',
        clientId: 'client-001',
        clientName: 'Acme Corporation',
        description: 'Follow-up email correspondence regarding contract revisions',
        hours: 0.5,
        rate: 350,
        amount: 175,
        date: new Date().toISOString().split('T')[0],
        status: 'draft',
        billable: true,
        activityType: 'correspondence',
        tags: ['email', 'follow-up']
      },
      {
        matterId: 'matter-002',
        matterTitle: 'TechStart Trademark Registration',
        clientId: 'client-002',
        clientName: 'TechStart Inc',
        description: 'Research competitor trademarks in similar class',
        hours: 2.0,
        rate: 425,
        amount: 850,
        date: new Date().toISOString().split('T')[0],
        status: 'draft',
        billable: true,
        activityType: 'legal_research',
        tags: ['research', 'competitor']
      },
      
      // Some non-billable entries
      {
        matterId: 'matter-001',
        matterTitle: 'Acme Corp Contract Review',
        clientId: 'client-001',
        clientName: 'Acme Corporation',
        description: 'Internal team meeting - case strategy discussion',
        hours: 1.0,
        rate: 0,
        amount: 0,
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'submitted',
        billable: false,
        activityType: 'internal_meeting',
        tags: ['internal', 'non-billable']
      }
    ];

    // Clear existing entries to avoid duplicates
    localStorage.setItem('timeEntries', JSON.stringify([]));
    
    // Create each mock entry
    for (const entry of mockEntries) {
      await this.createTimeEntry(entry);
    }
  }

  // ========================================
  // ENHANCED BILLING SERVICE METHODS
  // ========================================

  // Invoice Management
  static async createInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
      ...invoiceData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    invoices.push(invoice);
    localStorage.setItem('invoices', JSON.stringify(invoices));

    return invoice;
  }

  static async getInvoices(filters?: {
    status?: InvoiceStatus;
    clientId?: string;
    dateRange?: { start: string; end: string };
  }): Promise<Invoice[]> {
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    
    // Return empty array if no invoices exist instead of generating mock data
    if (!invoices.length) {
      return [];
    }

    let filtered = invoices;
    if (filters?.status) {
      filtered = filtered.filter((inv: Invoice) => inv.status === filters.status);
    }
    if (filters?.clientId) {
      filtered = filtered.filter((inv: Invoice) => inv.clientId === filters.clientId);
    }
    if (filters?.dateRange) {
      filtered = filtered.filter((inv: Invoice) => 
        inv.issueDate >= filters.dateRange!.start && inv.issueDate <= filters.dateRange!.end
      );
    }
    
    return filtered.sort((a: Invoice, b: Invoice) => 
      new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
    );
  }

  static async updateInvoiceStatus(invoiceId: string, status: InvoiceStatus): Promise<void> {
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    const index = invoices.findIndex((inv: Invoice) => inv.id === invoiceId);
    if (index !== -1) {
      invoices[index].status = status;
      invoices[index].updatedAt = new Date().toISOString();
      if (status === 'paid') {
        invoices[index].paidDate = new Date().toISOString();
      }
      localStorage.setItem('invoices', JSON.stringify(invoices));
    }
  }

  // Payment Management
  static async createPayment(payment: Omit<Payment, 'id'>): Promise<Payment> {
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      ...payment
    };

    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    payments.push(newPayment);
    localStorage.setItem('payments', JSON.stringify(payments));

    // Update invoice status if fully paid
    const invoice = await this.getInvoice(payment.invoiceId);
    if (invoice) {
      const invoicePayments = payments.filter((p: Payment) => p.invoiceId === payment.invoiceId);
      const totalPaid = invoicePayments.reduce((sum: number, p: Payment) => sum + p.amount, 0);
      
      if (totalPaid >= invoice.total) {
        await this.updateInvoiceStatus(payment.invoiceId, 'paid');
      }
    }

    return newPayment;
  }

  static async getPayments(invoiceId?: string): Promise<Payment[]> {
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    
    // Return empty array if no payments exist instead of generating mock data
    if (!payments.length) {
      return [];
    }

    return invoiceId 
      ? payments.filter((p: Payment) => p.invoiceId === invoiceId)
      : payments;
  }

  // Review Workflow Management
  static async getTimeEntriesForReview(): Promise<TimeEntry[]> {
    const entries = await this.getTimeEntries();
    return entries.filter(e => e.status === 'submitted' || e.status === 'draft');
  }

  static async getReviewWorkflows(timeEntryId?: string): Promise<ReviewWorkflow[]> {
    const workflows = JSON.parse(localStorage.getItem('reviewWorkflows') || '[]');
    
    // Return empty array if no workflows exist instead of generating mock data
    if (!workflows.length) {
      return [];
    }

    return timeEntryId
      ? workflows.filter((w: ReviewWorkflow) => w.timeEntryId === timeEntryId)
      : workflows;
  }

  static async createReviewWorkflow(workflow: Omit<ReviewWorkflow, 'id' | 'createdAt'>): Promise<ReviewWorkflow> {
    const newWorkflow: ReviewWorkflow = {
      id: `review-${Date.now()}`,
      ...workflow,
      createdAt: new Date().toISOString()
    };

    const workflows = JSON.parse(localStorage.getItem('reviewWorkflows') || '[]');
    workflows.push(newWorkflow);
    localStorage.setItem('reviewWorkflows', JSON.stringify(workflows));

    return newWorkflow;
  }

  static async updateReviewWorkflow(workflowId: string, updates: Partial<ReviewWorkflow>): Promise<void> {
    const workflows = JSON.parse(localStorage.getItem('reviewWorkflows') || '[]');
    const index = workflows.findIndex((w: ReviewWorkflow) => w.id === workflowId);
    if (index !== -1) {
      workflows[index] = { ...workflows[index], ...updates };
      if (updates.status === 'approved' || updates.status === 'rejected') {
        workflows[index].reviewedAt = new Date().toISOString();
      }
      localStorage.setItem('reviewWorkflows', JSON.stringify(workflows));
    }
  }

  // Client Payment Profiles
  static async getClientPaymentProfiles(): Promise<ClientPaymentProfile[]> {
    const profiles = JSON.parse(localStorage.getItem('clientPaymentProfiles') || '[]');
    
    // Return empty array if no profiles exist instead of generating mock data
    if (!profiles.length) {
      return [];
    }

    return profiles;
  }

  static async getClientPaymentProfile(clientId: string): Promise<ClientPaymentProfile | null> {
    const profiles = await this.getClientPaymentProfiles();
    return profiles.find(p => p.clientId === clientId) || null;
  }

  // Collections Management
  static async getCollectionActivities(invoiceId?: string): Promise<CollectionActivity[]> {
    const activities = JSON.parse(localStorage.getItem('collectionActivities') || '[]');
    
    // Return empty array if no activities exist instead of generating mock data
    if (!activities.length) {
      return [];
    }

    return invoiceId
      ? activities.filter((a: CollectionActivity) => a.invoiceId === invoiceId)
      : activities;
  }

  static async createCollectionActivity(activity: Omit<CollectionActivity, 'id'>): Promise<CollectionActivity> {
    const newActivity: CollectionActivity = {
      id: `collection-${Date.now()}`,
      ...activity
    };

    const activities = JSON.parse(localStorage.getItem('collectionActivities') || '[]');
    activities.push(newActivity);
    localStorage.setItem('collectionActivities', JSON.stringify(activities));

    return newActivity;
  }

  // Payment Reminders
  static async getPaymentReminders(invoiceId?: string): Promise<PaymentReminder[]> {
    const reminders = JSON.parse(localStorage.getItem('paymentReminders') || '[]');
    
    // Return empty array if no reminders exist instead of generating mock data
    if (!reminders.length) {
      return [];
    }

    return invoiceId
      ? reminders.filter((r: PaymentReminder) => r.invoiceId === invoiceId)
      : reminders;
  }

  static async createPaymentReminder(reminder: Omit<PaymentReminder, 'id'>): Promise<PaymentReminder> {
    const newReminder: PaymentReminder = {
      id: `reminder-${Date.now()}`,
      ...reminder
    };

    const reminders = JSON.parse(localStorage.getItem('paymentReminders') || '[]');
    reminders.push(newReminder);
    localStorage.setItem('paymentReminders', JSON.stringify(reminders));

    return newReminder;
  }

  // Advanced Analytics
  static async getAdvancedAnalytics(): Promise<{
    revenueByAttorney: Array<{ attorney: string; revenue: number; hours: number; }>;
    profitabilityByMatter: Array<{ matterId: string; matterTitle: string; revenue: number; cost: number; profit: number; }>;
    collectionMetrics: { averageDSO: number; collectionRate: number; overdueAmount: number; };
    utilizationMetrics: { billableUtilization: number; totalCapacity: number; targetUtilization: number; };
  }> {
    const timeEntries = await this.getTimeEntries();
    const invoices = await this.getInvoices();
    
    // Revenue by attorney (mock attorneys)
    const attorneys = ['Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Kim', 'Jessica Wilson'];
    const revenueByAttorney = attorneys.map(attorney => ({
      attorney,
      revenue: Math.floor(Math.random() * 200000) + 100000,
      hours: Math.floor(Math.random() * 800) + 1200
    }));

    // Profitability by matter (using existing time entries)
    const matterGroups = timeEntries.reduce((acc, entry) => {
      if (!acc[entry.matterId]) {
        acc[entry.matterId] = {
          matterId: entry.matterId,
          matterTitle: entry.matterTitle,
          revenue: 0,
          cost: 0
        };
      }
      acc[entry.matterId].revenue += entry.amount;
      acc[entry.matterId].cost += entry.amount * 0.4; // 40% cost ratio
      return acc;
    }, {} as Record<string, any>);

    const profitabilityByMatter = Object.values(matterGroups).map((matter: any) => ({
      ...matter,
      profit: matter.revenue - matter.cost
    }));

    // Collection metrics
    const totalInvoiced = invoices.reduce((sum: number, inv: Invoice) => sum + inv.total, 0);
    const paidInvoices = invoices.filter((inv: Invoice) => inv.status === 'paid');
    const totalPaid = paidInvoices.reduce((sum: number, inv: Invoice) => sum + inv.total, 0);
    const overdueInvoices = invoices.filter((inv: Invoice) => {
      return inv.status !== 'paid' && new Date(inv.dueDate) < new Date();
    });
    const overdueAmount = overdueInvoices.reduce((sum: number, inv: Invoice) => sum + inv.total, 0);

    const collectionMetrics = {
      averageDSO: 38,
      collectionRate: totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0,
      overdueAmount
    };

    // Utilization metrics
    const utilizationMetrics = {
      billableUtilization: 78.5,
      totalCapacity: 2000, // hours
      targetUtilization: 85
    };

    return {
      revenueByAttorney,
      profitabilityByMatter,
      collectionMetrics,
      utilizationMetrics
    };
  }

  // Helper method to get single invoice
  private static async getInvoice(invoiceId: string): Promise<Invoice | null> {
    const invoices = await this.getInvoices();
    return invoices.find(inv => inv.id === invoiceId) || null;
  }

  // ========================================
  // MOCK DATA GENERATION METHODS
  // ========================================

  static async generateMockInvoices(): Promise<void> {
    const mockInvoices: Invoice[] = [
      {
        id: 'inv-001',
        number: 'INV-2024-01-001',
        clientId: 'client-001',
        clientName: 'Acme Corporation',
        matterId: 'matter-001',
        matterTitle: 'Acme Corp Contract Review',
        status: 'paid',
        issueDate: '2024-01-15',
        dueDate: '2024-02-14',
        paidDate: '2024-02-10',
        subtotal: 12250,
        tax: 1225,
        total: 13475,
        timeEntries: [],
        expenses: [],
        notes: 'Contract review and negotiation services',
        paymentTerms: '30',
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-02-10T14:30:00Z'
      },
      {
        id: 'inv-002',
        number: 'INV-2024-01-002',
        clientId: 'client-002',
        clientName: 'TechStart Inc',
        matterId: 'matter-002',
        matterTitle: 'TechStart IP Portfolio',
        status: 'sent',
        issueDate: '2024-01-20',
        dueDate: '2024-02-19',
        subtotal: 8750,
        tax: 875,
        total: 9625,
        timeEntries: [],
        expenses: [],
        notes: 'Intellectual property consultation and filing',
        paymentTerms: '30',
        createdAt: '2024-01-20T10:15:00Z',
        updatedAt: '2024-01-20T10:15:00Z'
      },
      {
        id: 'inv-003',
        number: 'INV-2024-01-003',
        clientId: 'client-003',
        clientName: 'Global Manufacturing Ltd',
        matterId: 'matter-003',
        matterTitle: 'Employment Law Compliance',
        status: 'overdue',
        issueDate: '2024-01-05',
        dueDate: '2024-02-04',
        subtotal: 15750,
        tax: 1575,
        total: 17325,
        timeEntries: [],
        expenses: [],
        notes: 'Employment policy review and training materials',
        paymentTerms: '30',
        createdAt: '2024-01-05T11:30:00Z',
        updatedAt: '2024-01-05T11:30:00Z'
      },
      {
        id: 'inv-004',
        number: 'INV-2024-02-001',
        clientId: 'client-001',
        clientName: 'Acme Corporation',
        matterId: 'matter-004',
        matterTitle: 'Acme Merger Advisory',
        status: 'draft',
        issueDate: '2024-02-01',
        dueDate: '2024-03-03',
        subtotal: 25200,
        tax: 2520,
        total: 27720,
        timeEntries: [],
        expenses: [],
        notes: 'M&A due diligence and transaction support',
        paymentTerms: '30',
        createdAt: '2024-02-01T08:45:00Z',
        updatedAt: '2024-02-01T08:45:00Z'
      }
    ];

    localStorage.setItem('invoices', JSON.stringify(mockInvoices));
  }

  static async generateMockPayments(): Promise<void> {
    const mockPayments: Payment[] = [
      {
        id: 'pay-001',
        invoiceId: 'inv-001',
        amount: 13475,
        paymentDate: '2024-02-10',
        method: 'wire_transfer',
        status: 'paid',
        transactionId: 'TXN-20240210-001',
        notes: 'Full payment received via wire transfer'
      },
      {
        id: 'pay-002',
        invoiceId: 'inv-002',
        amount: 5000,
        paymentDate: '2024-02-15',
        method: 'check',
        status: 'paid',
        transactionId: 'CHK-5647',
        notes: 'Partial payment - check #5647'
      }
    ];

    localStorage.setItem('payments', JSON.stringify(mockPayments));
  }

  static async generateMockReviewWorkflows(): Promise<void> {
    const mockWorkflows: ReviewWorkflow[] = [
      {
        id: 'review-001',
        timeEntryId: 'te-001',
        reviewerId: 'user-partner-001',
        reviewerName: 'Sarah Johnson',
        status: 'approved',
        comments: 'Time entry looks accurate. Rate adjustment applied for senior work.',
        reviewedAt: '2024-01-16T14:20:00Z',
        createdAt: '2024-01-15T16:30:00Z'
      },
      {
        id: 'review-002',
        timeEntryId: 'te-002',
        reviewerId: 'user-senior-001',
        reviewerName: 'Michael Chen',
        status: 'needs_revision',
        comments: 'Please provide more detailed description of the research performed.',
        createdAt: '2024-01-20T09:15:00Z'
      },
      {
        id: 'review-003',
        timeEntryId: 'te-003',
        reviewerId: 'user-partner-002',
        reviewerName: 'Emily Rodriguez',
        status: 'pending',
        comments: '',
        createdAt: '2024-01-22T11:45:00Z'
      }
    ];

    localStorage.setItem('reviewWorkflows', JSON.stringify(mockWorkflows));
  }

  static async generateMockClientPaymentProfiles(): Promise<void> {
    const mockProfiles: ClientPaymentProfile[] = [
      {
        clientId: 'client-001',
        clientName: 'Acme Corporation',
        averagePaymentDays: 25,
        paymentReliability: 'excellent',
        totalInvoiced: 125000,
        totalPaid: 112500,
        currentBalance: 12500,
        creditLimit: 50000,
        paymentMethod: 'wire',
        lastPaymentDate: '2024-02-10'
      },
      {
        clientId: 'client-002',
        clientName: 'TechStart Inc',
        averagePaymentDays: 42,
        paymentReliability: 'good',
        totalInvoiced: 65000,
        totalPaid: 45000,
        currentBalance: 20000,
        creditLimit: 25000,
        paymentMethod: 'check',
        lastPaymentDate: '2024-02-15'
      },
      {
        clientId: 'client-003',
        clientName: 'Global Manufacturing Ltd',
        averagePaymentDays: 65,
        paymentReliability: 'fair',
        totalInvoiced: 85000,
        totalPaid: 55000,
        currentBalance: 30000,
        creditLimit: 35000,
        paymentMethod: 'ach',
        lastPaymentDate: '2024-01-20'
      }
    ];

    localStorage.setItem('clientPaymentProfiles', JSON.stringify(mockProfiles));
  }

  static async generateMockCollectionActivities(): Promise<void> {
    const mockActivities: CollectionActivity[] = [
      {
        id: 'coll-001',
        invoiceId: 'inv-003',
        activityType: 'reminder_sent',
        description: 'First payment reminder sent via email',
        assignedTo: 'collections@firm.com',
        dueDate: '2024-02-15',
        completedAt: '2024-02-10T10:00:00Z',
        outcome: 'No response received'
      },
      {
        id: 'coll-002',
        invoiceId: 'inv-003',
        activityType: 'call_made',
        description: 'Follow-up call to accounts payable department',
        assignedTo: 'Sarah Johnson',
        dueDate: '2024-02-20',
        completedAt: '2024-02-18T14:30:00Z',
        outcome: 'Client requested 30-day extension'
      },
      {
        id: 'coll-003',
        invoiceId: 'inv-003',
        activityType: 'payment_plan',
        description: 'Set up payment plan for outstanding balance',
        assignedTo: 'Michael Chen',
        dueDate: '2024-02-25',
        outcome: 'Payment plan agreed - 3 installments'
      }
    ];

    localStorage.setItem('collectionActivities', JSON.stringify(mockActivities));
  }

  static async generateMockPaymentReminders(): Promise<void> {
    const mockReminders: PaymentReminder[] = [
      {
        id: 'reminder-001',
        invoiceId: 'inv-003',
        type: 'initial',
        sentAt: '2024-02-05T09:00:00Z',
        daysOverdue: 1,
        response: 'no_response'
      },
      {
        id: 'reminder-002',
        invoiceId: 'inv-003',
        type: 'follow_up',
        sentAt: '2024-02-15T09:00:00Z',
        daysOverdue: 11,
        response: 'no_response'
      },
      {
        id: 'reminder-003',
        invoiceId: 'inv-002',
        type: 'initial',
        sentAt: '2024-02-20T09:00:00Z',
        daysOverdue: 1
      }
    ];

    localStorage.setItem('paymentReminders', JSON.stringify(mockReminders));
  }

  // Initialize all mock data
  static async initializeMockData(): Promise<void> {
    await this.generateMockInvoices();
    await this.generateMockPayments();
    await this.generateMockReviewWorkflows();
    await this.generateMockClientPaymentProfiles();
    await this.generateMockCollectionActivities();
    await this.generateMockPaymentReminders();
  }
}