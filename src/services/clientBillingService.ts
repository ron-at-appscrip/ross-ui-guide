import { supabase } from '@/integrations/supabase/client';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  date: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  subtotal: number;
  tax: number;
  total: number;
  lineItems: InvoiceLineItem[];
  notes?: string;
  paymentTerms: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface TimeEntry {
  id: string;
  clientId: string;
  matterId?: string;
  description: string;
  date: string;
  hours: number;
  rate: number;
  amount: number;
  billable: boolean;
  invoiceId?: string;
  attorneyId: string;
  attorneyName: string;
  createdAt: string;
}

export interface BillingSummary {
  totalBilled: number;
  outstandingBalance: number;
  paidThisMonth: number;
  pendingInvoices: number;
  overdueInvoices: number;
  averagePaymentTime: number;
}

class ClientBillingService {
  async getClientBillingSummary(clientId: string): Promise<BillingSummary> {
    try {
      // This would integrate with Supabase in a real implementation
      // For now, return mock data based on clientId
      const mockSummary: BillingSummary = {
        totalBilled: 125000,
        outstandingBalance: 15000,
        paidThisMonth: 8500,
        pendingInvoices: 2,
        overdueInvoices: 1,
        averagePaymentTime: 28
      };

      return mockSummary;
    } catch (error) {
      console.error('Error fetching billing summary:', error);
      throw new Error('Failed to fetch billing summary');
    }
  }

  async getClientInvoices(clientId: string): Promise<Invoice[]> {
    try {
      // This would integrate with Supabase in a real implementation
      const mockInvoices: Invoice[] = [
        {
          id: '1',
          invoiceNumber: 'INV-2024-001',
          clientId,
          clientName: 'John Smith',
          date: '2024-03-01',
          dueDate: '2024-03-31',
          status: 'sent',
          subtotal: 15000,
          tax: 1200,
          total: 16200,
          paymentTerms: 'Net 30',
          notes: 'Corporate merger legal services',
          createdAt: '2024-03-01T00:00:00Z',
          updatedAt: '2024-03-01T00:00:00Z',
          lineItems: [
            {
              id: '1',
              description: 'Legal consultation and document review',
              quantity: 20,
              rate: 750,
              amount: 15000
            }
          ]
        },
        {
          id: '2',
          invoiceNumber: 'INV-2024-002',
          clientId,
          clientName: 'John Smith',
          date: '2024-02-15',
          dueDate: '2024-03-15',
          status: 'paid',
          subtotal: 8500,
          tax: 680,
          total: 9180,
          paymentTerms: 'Net 30',
          notes: 'Contract review services',
          createdAt: '2024-02-15T00:00:00Z',
          updatedAt: '2024-03-20T00:00:00Z',
          lineItems: [
            {
              id: '2',
              description: 'Contract analysis and negotiation support',
              quantity: 12,
              rate: 708.33,
              amount: 8500
            }
          ]
        }
      ];

      return mockInvoices;
    } catch (error) {
      console.error('Error fetching client invoices:', error);
      throw new Error('Failed to fetch client invoices');
    }
  }

  async createInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    try {
      // This would integrate with Supabase in a real implementation
      const newInvoice: Invoice = {
        ...invoiceData,
        id: `inv_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return newInvoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw new Error('Failed to create invoice');
    }
  }

  async updateInvoice(invoiceId: string, updates: Partial<Invoice>): Promise<Invoice> {
    try {
      // This would integrate with Supabase in a real implementation
      const existingInvoice = await this.getInvoiceById(invoiceId);
      
      const updatedInvoice: Invoice = {
        ...existingInvoice,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return updatedInvoice;
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw new Error('Failed to update invoice');
    }
  }

  async getInvoiceById(invoiceId: string): Promise<Invoice> {
    try {
      // This would integrate with Supabase in a real implementation
      const mockInvoice: Invoice = {
        id: invoiceId,
        invoiceNumber: 'INV-2024-001',
        clientId: '1',
        clientName: 'John Smith',
        date: '2024-03-01',
        dueDate: '2024-03-31',
        status: 'sent',
        subtotal: 15000,
        tax: 1200,
        total: 16200,
        paymentTerms: 'Net 30',
        notes: 'Corporate merger legal services',
        createdAt: '2024-03-01T00:00:00Z',
        updatedAt: '2024-03-01T00:00:00Z',
        lineItems: [
          {
            id: '1',
            description: 'Legal consultation and document review',
            quantity: 20,
            rate: 750,
            amount: 15000
          }
        ]
      };

      return mockInvoice;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw new Error('Failed to fetch invoice');
    }
  }

  async deleteInvoice(invoiceId: string): Promise<void> {
    try {
      // This would integrate with Supabase in a real implementation
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw new Error('Failed to delete invoice');
    }
  }

  async sendInvoice(invoiceId: string, emailOptions?: { to: string; subject?: string; message?: string }): Promise<void> {
    try {
      // This would integrate with email service in a real implementation
      await this.updateInvoice(invoiceId, { status: 'sent' });
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.error('Error sending invoice:', error);
      throw new Error('Failed to send invoice');
    }
  }

  async getClientTimeEntries(clientId: string, options?: { 
    matterId?: string; 
    startDate?: string; 
    endDate?: string; 
    billable?: boolean 
  }): Promise<TimeEntry[]> {
    try {
      // This would integrate with Supabase in a real implementation
      const mockTimeEntries: TimeEntry[] = [
        {
          id: '1',
          clientId,
          matterId: '1',
          description: 'Contract review and analysis',
          date: '2024-03-10',
          hours: 3.5,
          rate: 750,
          amount: 2625,
          billable: true,
          attorneyId: '1',
          attorneyName: 'Sarah Johnson',
          createdAt: '2024-03-10T00:00:00Z'
        },
        {
          id: '2',
          clientId,
          matterId: '1',
          description: 'Client consultation call',
          date: '2024-03-08',
          hours: 1.0,
          rate: 750,
          amount: 750,
          billable: true,
          attorneyId: '1',
          attorneyName: 'Sarah Johnson',
          createdAt: '2024-03-08T00:00:00Z'
        }
      ];

      // Apply filters if provided
      let filteredEntries = mockTimeEntries;
      
      if (options?.matterId) {
        filteredEntries = filteredEntries.filter(entry => entry.matterId === options.matterId);
      }
      
      if (options?.billable !== undefined) {
        filteredEntries = filteredEntries.filter(entry => entry.billable === options.billable);
      }

      return filteredEntries;
    } catch (error) {
      console.error('Error fetching time entries:', error);
      throw new Error('Failed to fetch time entries');
    }
  }

  async generateInvoiceFromTimeEntries(
    clientId: string, 
    timeEntryIds: string[], 
    invoiceDetails: {
      dueDate: string;
      paymentTerms: string;
      notes?: string;
    }
  ): Promise<Invoice> {
    try {
      // This would integrate with Supabase in a real implementation
      const timeEntries = await this.getClientTimeEntries(clientId);
      const selectedEntries = timeEntries.filter(entry => timeEntryIds.includes(entry.id));
      
      const lineItems: InvoiceLineItem[] = selectedEntries.map(entry => ({
        id: entry.id,
        description: entry.description,
        quantity: entry.hours,
        rate: entry.rate,
        amount: entry.amount
      }));

      const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
      const tax = subtotal * 0.08; // 8% tax rate
      const total = subtotal + tax;

      const invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> = {
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
        clientId,
        clientName: 'John Smith', // This would come from client data
        date: new Date().toISOString().split('T')[0],
        dueDate: invoiceDetails.dueDate,
        status: 'draft',
        subtotal,
        tax,
        total,
        lineItems,
        notes: invoiceDetails.notes,
        paymentTerms: invoiceDetails.paymentTerms
      };

      return await this.createInvoice(invoiceData);
    } catch (error) {
      console.error('Error generating invoice from time entries:', error);
      throw new Error('Failed to generate invoice from time entries');
    }
  }
}

export const clientBillingService = new ClientBillingService();