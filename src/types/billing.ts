
export type TimeEntryStatus = 'draft' | 'submitted' | 'billed' | 'paid';
export type InvoiceStatus = 'draft' | 'sent' | 'overdue' | 'paid' | 'cancelled';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'failed';

export interface TimeEntry {
  id: string;
  userId?: string;
  matterId: string;
  matterTitle: string;
  clientId: string;
  clientName: string;
  description: string;
  hours: number;
  rate: number;
  amount: number;
  date: string;
  startTime?: string;
  endTime?: string;
  status: TimeEntryStatus;
  billable: boolean;
  activityType?: string;
  createdAt: string;
  updatedAt: string;
  aiSuggested?: boolean;
  tags: string[];
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  matterId?: string;
  matterTitle?: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  subtotal: number;
  tax: number;
  total: number;
  timeEntries: TimeEntry[];
  expenses: any[];
  notes?: string;
  paymentTerms: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  method: string;
  status: PaymentStatus;
  transactionId?: string;
  notes?: string;
}

export interface BillingAnalytics {
  realizationRate: number;
  utilizationRate: number;
  totalBilled: number;
  totalCollected: number;
  outstandingAmount: number;
  averageCollectionTime: number;
  profitabilityByClient: {
    clientId: string;
    clientName: string;
    revenue: number;
    profit: number;
    margin: number;
  }[];
  revenueByMonth: {
    month: string;
    revenue: number;
    forecast: number;
  }[];
}

export interface TimerSession {
  id: string;
  matterId: string;
  matterTitle: string;
  description: string;
  startTime: string;
  endTime?: string;
  duration: number;
  isActive: boolean;
}

// Enhanced interfaces for comprehensive billing system
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
