// Simple script to initialize mock data for the billing system
console.log('Initializing mock data for billing system...');

// Mock time entries
const mockTimeEntries = [
  {
    id: '1',
    userId: 'attorney-1',
    matterId: 'matter-1',
    matterTitle: 'Corporate Merger - TechCorp',
    clientId: 'client-1',
    clientName: 'TechCorp Inc.',
    description: 'Review merger agreement and conduct due diligence',
    hours: 4.5,
    rate: 350,
    amount: 1575,
    date: '2024-01-15',
    status: 'draft',
    billable: true,
    activityType: 'document_review',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    tags: ['merger', 'due-diligence']
  },
  {
    id: '2',
    userId: 'attorney-2',
    matterId: 'matter-2',
    matterTitle: 'Patent Litigation - InnovateTech',
    clientId: 'client-2',
    clientName: 'InnovateTech Solutions',
    description: 'Prepare motion for summary judgment',
    hours: 6.0,
    rate: 400,
    amount: 2400,
    date: '2024-01-14',
    status: 'submitted',
    billable: true,
    activityType: 'document_drafting',
    createdAt: '2024-01-14T14:30:00Z',
    updatedAt: '2024-01-14T14:30:00Z',
    tags: ['litigation', 'patent']
  },
  {
    id: '3',
    userId: 'attorney-1',
    matterId: 'matter-3',
    matterTitle: 'Real Estate Transaction - Metro Properties',
    clientId: 'client-3',
    clientName: 'Metro Properties LLC',
    description: 'Negotiate purchase agreement terms',
    hours: 3.0,
    rate: 350,
    amount: 1050,
    date: '2024-01-13',
    status: 'billed',
    billable: true,
    activityType: 'negotiation',
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T09:15:00Z',
    tags: ['real-estate', 'transaction']
  },
  {
    id: '4',
    userId: 'attorney-3',
    matterId: 'matter-4',
    matterTitle: 'Employment Dispute - Global Corp',
    clientId: 'client-4',
    clientName: 'Global Corporation',
    description: 'Investigate harassment allegations',
    hours: 5.5,
    rate: 375,
    amount: 2062.5,
    date: '2024-01-12',
    status: 'draft',
    billable: true,
    activityType: 'investigation',
    createdAt: '2024-01-12T16:45:00Z',
    updatedAt: '2024-01-12T16:45:00Z',
    tags: ['employment', 'investigation']
  },
  {
    id: '5',
    userId: 'attorney-2',
    matterId: 'matter-5',
    matterTitle: 'IP Licensing - StartupXYZ',
    clientId: 'client-5',
    clientName: 'StartupXYZ',
    description: 'Draft licensing agreement',
    hours: 7.0,
    rate: 400,
    amount: 2800,
    date: '2024-01-11',
    status: 'submitted',
    billable: true,
    activityType: 'document_drafting',
    createdAt: '2024-01-11T11:20:00Z',
    updatedAt: '2024-01-11T11:20:00Z',
    tags: ['ip', 'licensing']
  }
];

// Mock invoices
const mockInvoices = [
  {
    id: 'inv-1',
    number: 'INV-2024-001',
    clientId: 'client-1',
    clientName: 'TechCorp Inc.',
    matterId: 'matter-1',
    matterTitle: 'Corporate Merger - TechCorp',
    status: 'paid',
    issueDate: '2024-01-10',
    dueDate: '2024-02-10',
    paidDate: '2024-01-25',
    subtotal: 15750,
    tax: 1575,
    total: 17325,
    timeEntries: mockTimeEntries.filter(entry => entry.matterId === 'matter-1'),
    expenses: [],
    notes: 'Merger due diligence services',
    paymentTerms: 'Net 30',
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-25T00:00:00Z'
  },
  {
    id: 'inv-2',
    number: 'INV-2024-002',
    clientId: 'client-2',
    clientName: 'InnovateTech Solutions',
    matterId: 'matter-2',
    matterTitle: 'Patent Litigation - InnovateTech',
    status: 'sent',
    issueDate: '2024-01-15',
    dueDate: '2024-02-15',
    subtotal: 24000,
    tax: 2400,
    total: 26400,
    timeEntries: mockTimeEntries.filter(entry => entry.matterId === 'matter-2'),
    expenses: [],
    notes: 'Patent litigation services',
    paymentTerms: 'Net 30',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'inv-3',
    number: 'INV-2024-003',
    clientId: 'client-3',
    clientName: 'Metro Properties LLC',
    matterId: 'matter-3',
    matterTitle: 'Real Estate Transaction - Metro Properties',
    status: 'overdue',
    issueDate: '2024-01-05',
    dueDate: '2024-02-05',
    subtotal: 10500,
    tax: 1050,
    total: 11550,
    timeEntries: mockTimeEntries.filter(entry => entry.matterId === 'matter-3'),
    expenses: [],
    notes: 'Real estate transaction services',
    paymentTerms: 'Net 30',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z'
  }
];

// Mock payments
const mockPayments = [
  {
    id: 'pay-1',
    invoiceId: 'inv-1',
    amount: 17325,
    paymentDate: '2024-01-25',
    method: 'wire',
    status: 'paid',
    transactionId: 'TXN-001',
    notes: 'Full payment received'
  }
];

// Mock review workflows
const mockReviewWorkflows = [
  {
    id: 'review-1',
    timeEntryId: '2',
    reviewerId: 'senior-attorney',
    reviewerName: 'Senior Attorney',
    status: 'approved',
    comments: 'Excellent work on the motion. Ready for filing.',
    reviewedAt: '2024-01-15T10:00:00Z',
    createdAt: '2024-01-15T09:00:00Z'
  },
  {
    id: 'review-2',
    timeEntryId: '5',
    reviewerId: 'senior-attorney',
    reviewerName: 'Senior Attorney',
    status: 'needs_revision',
    comments: 'Please add more detail to the licensing terms section.',
    reviewedAt: '2024-01-12T14:00:00Z',
    createdAt: '2024-01-12T13:00:00Z'
  }
];

// Store mock data in localStorage
localStorage.setItem('timeEntries', JSON.stringify(mockTimeEntries));
localStorage.setItem('invoices', JSON.stringify(mockInvoices));
localStorage.setItem('payments', JSON.stringify(mockPayments));
localStorage.setItem('reviewWorkflows', JSON.stringify(mockReviewWorkflows));

console.log('Mock data initialized successfully!');
console.log(`- ${mockTimeEntries.length} time entries`);
console.log(`- ${mockInvoices.length} invoices`);
console.log(`- ${mockPayments.length} payments`);
console.log(`- ${mockReviewWorkflows.length} review workflows`); 