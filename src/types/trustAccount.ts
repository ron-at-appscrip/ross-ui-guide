// Trust Account Management Types

export type TrustTransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'adjustment' | 'interest';
export type TrustAccountStatus = 'active' | 'inactive' | 'frozen' | 'closed';
export type TransferType = 'trust_to_operating' | 'operating_to_trust' | 'trust_to_trust';
export type ComplianceStatus = 'compliant' | 'warning' | 'violation' | 'under_review';

export interface TrustAccount {
  id: string;
  clientId: string;
  clientName: string;
  matterId?: string;
  matterTitle?: string;
  accountNumber: string;
  accountName: string;
  
  // Financial information
  currentBalance: number;
  availableBalance: number;
  pendingBalance: number;
  reservedBalance: number;
  
  // Account details
  bankName: string;
  routingNumber: string;
  accountType: 'checking' | 'savings' | 'money_market';
  currency: string;
  
  // Status and compliance
  status: TrustAccountStatus;
  ioltaCompliant: boolean;
  requiresIOLTA: boolean;
  minimumBalance: number;
  
  // Audit and tracking
  openedDate: string;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  
  // Metadata
  purpose: string;
  notes?: string;
  tags: string[];
}

export interface TrustTransaction {
  id: string;
  trustAccountId: string;
  
  // Transaction details
  type: TrustTransactionType;
  amount: number;
  runningBalance: number;
  description: string;
  reference: string;
  
  // Related entities
  matterId?: string;
  clientId?: string;
  invoiceId?: string;
  
  // Transfer specific
  transferType?: TransferType;
  fromAccountId?: string;
  toAccountId?: string;
  
  // Authorization
  authorizedBy: string;
  authorizedAt: string;
  authorizationReason: string;
  
  // Processing
  processedAt: string;
  processedBy: string;
  batchId?: string;
  
  // Reconciliation
  reconciledAt?: string;
  reconciledBy?: string;
  bankStatementId?: string;
  
  // Metadata
  metadata: Record<string, any>;
  attachments: TrustTransactionAttachment[];
  
  // Audit
  createdAt: string;
  updatedAt: string;
}

export interface TrustTransactionAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
  url: string;
}

export interface AuthorizationRecord {
  authorizedBy: string;
  authorizedAt: string;
  reason: string;
  ipAddress?: string;
  userAgent?: string;
  method: 'password' | 'two_factor' | 'digital_signature';
}

export interface TrustAccountAlert {
  id: string;
  trustAccountId: string;
  type: 'low_balance' | 'high_activity' | 'compliance_issue' | 'reconciliation_error' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  threshold?: number;
  currentValue?: number;
  isActive: boolean;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}

export interface TrustAccountReconciliation {
  id: string;
  trustAccountId: string;
  
  // Reconciliation period
  periodStart: string;
  periodEnd: string;
  
  // Balances
  bookBalance: number;
  bankBalance: number;
  difference: number;
  
  // Status
  status: 'pending' | 'in_progress' | 'completed' | 'discrepancy' | 'cancelled';
  reconciledBy?: string;
  reconciledAt?: string;
  
  // Bank statement information
  statementId: string;
  statementDate: string;
  statementBalance: number;
  
  // Reconciled transactions
  reconciledTransactions: string[];
  unreconciledTransactions: string[];
  
  // Discrepancies
  discrepancies: ReconciliationDiscrepancy[];
  
  // Notes and metadata
  notes?: string;
  attachments: TrustTransactionAttachment[];
  
  createdAt: string;
  updatedAt: string;
}

export interface ReconciliationDiscrepancy {
  id: string;
  type: 'missing_transaction' | 'amount_mismatch' | 'date_mismatch' | 'duplicate_transaction';
  description: string;
  bookAmount?: number;
  bankAmount?: number;
  transactionId?: string;
  resolved: boolean;
  resolution?: string;
}

export interface IOLTAComplianceReport {
  id: string;
  trustAccountId?: string; // If null, report covers all trust accounts
  
  // Report period
  reportPeriod: {
    startDate: string;
    endDate: string;
    quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
    year: number;
  };
  
  // Compliance status
  overallStatus: ComplianceStatus;
  complianceScore: number; // 0-100
  
  // Financial summary
  summary: {
    totalTrustBalance: number;
    averageBalance: number;
    interestEarned: number;
    interestDistributed: number;
    totalDeposits: number;
    totalWithdrawals: number;
    accountCount: number;
  };
  
  // Violations and issues
  violations: IOLTAViolation[];
  warnings: IOLTAWarning[];
  
  // Required filings
  requiredFilings: IOLTAFiling[];
  
  // Generated data
  generatedAt: string;
  generatedBy: string;
  submittedAt?: string;
  submittedBy?: string;
  
  // Report files
  reportFiles: ReportFile[];
}

export interface IOLTAViolation {
  id: string;
  type: 'insufficient_balance' | 'unauthorized_withdrawal' | 'commingling' | 'late_filing' | 'missing_records';
  severity: 'minor' | 'major' | 'severe';
  description: string;
  detectedAt: string;
  amount?: number;
  transactionIds: string[];
  status: 'open' | 'resolved' | 'disputed';
  resolution?: string;
  resolvedAt?: string;
}

export interface IOLTAWarning {
  id: string;
  type: 'approaching_deadline' | 'unusual_activity' | 'low_balance' | 'missing_documentation';
  message: string;
  actionRequired: string;
  deadline?: string;
  acknowledged: boolean;
}

export interface IOLTAFiling {
  id: string;
  type: 'quarterly_report' | 'annual_report' | 'interest_distribution' | 'violation_report';
  dueDate: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'submitted' | 'overdue';
  submittedAt?: string;
  confirmationNumber?: string;
  filingUrl?: string;
}

export interface ReportFile {
  id: string;
  fileName: string;
  fileType: 'pdf' | 'excel' | 'csv' | 'xml';
  size: number;
  generatedAt: string;
  downloadUrl: string;
}

export interface TrustAccountFilters {
  clientIds?: string[];
  matterIds?: string[];
  status?: TrustAccountStatus[];
  balanceRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  complianceStatus?: ComplianceStatus[];
  accountTypes?: string[];
  search?: string;
}

export interface TrustTransactionFilters {
  trustAccountIds?: string[];
  types?: TrustTransactionType[];
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  clientIds?: string[];
  matterIds?: string[];
  authorizedBy?: string[];
  reconciledStatus?: 'reconciled' | 'unreconciled' | 'all';
  search?: string;
}

export interface TrustAccountSummary {
  totalAccounts: number;
  activeAccounts: number;
  totalBalance: number;
  averageBalance: number;
  complianceRate: number;
  
  // Transaction summary
  monthlyTransactions: {
    deposits: number;
    withdrawals: number;
    transfers: number;
    netChange: number;
  };
  
  // Alerts summary
  activeAlerts: number;
  criticalAlerts: number;
  overdueReconciliations: number;
  
  // Compliance summary
  compliantAccounts: number;
  violationCount: number;
  warningCount: number;
}

export interface TrustAccountAuditLog {
  id: string;
  trustAccountId?: string;
  transactionId?: string;
  
  // Action details
  action: 'create' | 'update' | 'delete' | 'transfer' | 'reconcile' | 'authorize' | 'freeze' | 'unfreeze';
  entity: 'account' | 'transaction' | 'reconciliation' | 'alert' | 'compliance';
  entityId: string;
  
  // User information
  userId: string;
  userName: string;
  userRole: string;
  ipAddress: string;
  userAgent: string;
  
  // Changes
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
  
  // Context
  reason?: string;
  metadata: Record<string, any>;
  
  // Timestamp
  timestamp: string;
}

export interface TrustAccountSettings {
  // Default settings
  defaultCurrency: string;
  defaultMinimumBalance: number;
  autoReconciliationEnabled: boolean;
  
  // Alert thresholds
  lowBalanceThreshold: number;
  highActivityThreshold: number;
  
  // Compliance settings
  requireDualApproval: boolean;
  dualApprovalThreshold: number;
  autoInterestCalculation: boolean;
  interestRate: number;
  
  // Notifications
  emailNotifications: boolean;
  smsNotifications: boolean;
  notificationRecipients: string[];
  
  // Integration settings
  bankIntegrationEnabled: boolean;
  autoImportTransactions: boolean;
  
  // Security settings
  requireMFA: boolean;
  sessionTimeout: number;
  
  // Backup settings
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  
  updatedAt: string;
  updatedBy: string;
}

export interface BankIntegration {
  id: string;
  bankName: string;
  connectionStatus: 'connected' | 'disconnected' | 'error' | 'pending';
  lastSync: string;
  
  // Connection details
  apiEndpoint: string;
  authMethod: 'oauth' | 'api_key' | 'certificate';
  
  // Sync settings
  autoSync: boolean;
  syncFrequency: 'real_time' | 'hourly' | 'daily' | 'manual';
  
  // Error handling
  lastError?: string;
  errorCount: number;
  retryCount: number;
  
  // Mapped accounts
  mappedAccounts: BankAccountMapping[];
  
  createdAt: string;
  updatedAt: string;
}

export interface BankAccountMapping {
  bankAccountId: string;
  bankAccountNumber: string;
  trustAccountId: string;
  isActive: boolean;
}

// Mock data structure for development
export interface MockTrustAccountData {
  accounts: TrustAccount[];
  transactions: TrustTransaction[];
  reconciliations: TrustAccountReconciliation[];
  alerts: TrustAccountAlert[];
  complianceReports: IOLTAComplianceReport[];
  auditLog: TrustAccountAuditLog[];
  settings: TrustAccountSettings;
  bankIntegrations: BankIntegration[];
}