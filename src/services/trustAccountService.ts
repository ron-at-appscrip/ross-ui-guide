import {
  TrustAccount,
  TrustTransaction,
  TrustTransactionType,
  TrustAccountStatus,
  TrustAccountAlert,
  TrustAccountReconciliation,
  IOLTAComplianceReport,
  TrustAccountSummary,
  TrustAccountFilters,
  TrustTransactionFilters,
  TrustAccountAuditLog,
  TrustAccountSettings,
  MockTrustAccountData,
  AuthorizationRecord,
  TransferType,
  ComplianceStatus
} from '@/types/trustAccount';

export class TrustAccountService {
  private static readonly STORAGE_KEY = 'trust_accounts';
  private static readonly TRANSACTIONS_KEY = 'trust_transactions';
  private static readonly ALERTS_KEY = 'trust_alerts';
  private static readonly RECONCILIATIONS_KEY = 'trust_reconciliations';
  private static readonly AUDIT_LOG_KEY = 'trust_audit_log';
  private static readonly SETTINGS_KEY = 'trust_settings';

  // Account Management
  static async getAccounts(filters?: TrustAccountFilters): Promise<TrustAccount[]> {
    const accounts = this.loadAccounts();
    
    if (!filters) return accounts;

    return accounts.filter(account => {
      if (filters.clientIds && !filters.clientIds.includes(account.clientId)) return false;
      if (filters.matterIds && filters.matterIds.length > 0) {
        if (!account.matterId || !filters.matterIds.includes(account.matterId)) return false;
      }
      if (filters.status && !filters.status.includes(account.status)) return false;
      if (filters.balanceRange) {
        if (account.currentBalance < filters.balanceRange.min || 
            account.currentBalance > filters.balanceRange.max) return false;
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!account.clientName.toLowerCase().includes(searchLower) &&
            !account.accountName.toLowerCase().includes(searchLower) &&
            !account.accountNumber.toLowerCase().includes(searchLower)) return false;
      }
      return true;
    });
  }

  static async getAccount(id: string): Promise<TrustAccount | null> {
    const accounts = this.loadAccounts();
    return accounts.find(account => account.id === id) || null;
  }

  static async createAccount(accountData: Omit<TrustAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<TrustAccount> {
    const newAccount: TrustAccount = {
      ...accountData,
      id: `trust-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const accounts = this.loadAccounts();
    accounts.push(newAccount);
    this.saveAccounts(accounts);

    // Create audit log entry
    await this.createAuditLogEntry({
      action: 'create',
      entity: 'account',
      entityId: newAccount.id,
      userId: 'current-user',
      userName: 'Current User',
      userRole: 'attorney',
      ipAddress: '127.0.0.1',
      userAgent: 'Ross AI App',
      newValues: newAccount,
      reason: 'New trust account created',
      metadata: { accountType: newAccount.accountType, client: newAccount.clientName }
    });

    return newAccount;
  }

  static async updateAccount(id: string, updates: Partial<TrustAccount>): Promise<TrustAccount> {
    const accounts = this.loadAccounts();
    const index = accounts.findIndex(account => account.id === id);
    
    if (index === -1) {
      throw new Error('Trust account not found');
    }

    const previousAccount = { ...accounts[index] };
    accounts[index] = {
      ...accounts[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveAccounts(accounts);

    // Create audit log entry
    await this.createAuditLogEntry({
      action: 'update',
      entity: 'account',
      entityId: id,
      userId: 'current-user',
      userName: 'Current User',
      userRole: 'attorney',
      ipAddress: '127.0.0.1',
      userAgent: 'Ross AI App',
      previousValues: previousAccount,
      newValues: updates,
      reason: 'Trust account updated',
      metadata: { fields: Object.keys(updates) }
    });

    return accounts[index];
  }

  static async closeAccount(id: string, reason: string): Promise<void> {
    const account = await this.getAccount(id);
    if (!account) throw new Error('Trust account not found');

    if (account.currentBalance > 0) {
      throw new Error('Cannot close account with remaining balance');
    }

    await this.updateAccount(id, {
      status: 'closed',
      notes: `${account.notes || ''}\nClosed: ${reason}`.trim()
    });
  }

  // Transaction Management
  static async getTransactions(filters?: TrustTransactionFilters): Promise<TrustTransaction[]> {
    const transactions = this.loadTransactions();
    
    if (!filters) return transactions.sort((a, b) => new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime());

    const filtered = transactions.filter(transaction => {
      if (filters.trustAccountIds && !filters.trustAccountIds.includes(transaction.trustAccountId)) return false;
      if (filters.types && !filters.types.includes(transaction.type)) return false;
      if (filters.dateRange) {
        if (transaction.processedAt < filters.dateRange.startDate || 
            transaction.processedAt > filters.dateRange.endDate) return false;
      }
      if (filters.amountRange) {
        if (transaction.amount < filters.amountRange.min || 
            transaction.amount > filters.amountRange.max) return false;
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!transaction.description.toLowerCase().includes(searchLower) &&
            !transaction.reference.toLowerCase().includes(searchLower)) return false;
      }
      return true;
    });

    return filtered.sort((a, b) => new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime());
  }

  static async createTransaction(
    trustAccountId: string,
    transactionData: {
      type: TrustTransactionType;
      amount: number;
      description: string;
      reference: string;
      matterId?: string;
      clientId?: string;
      authorizationReason: string;
    }
  ): Promise<TrustTransaction> {
    const account = await this.getAccount(trustAccountId);
    if (!account) throw new Error('Trust account not found');

    // Validate transaction
    if (transactionData.type === 'withdrawal' && account.currentBalance < transactionData.amount) {
      throw new Error('Insufficient funds for withdrawal');
    }

    const newBalance = transactionData.type === 'deposit' 
      ? account.currentBalance + transactionData.amount
      : account.currentBalance - transactionData.amount;

    const transaction: TrustTransaction = {
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      trustAccountId,
      type: transactionData.type,
      amount: transactionData.amount,
      runningBalance: newBalance,
      description: transactionData.description,
      reference: transactionData.reference,
      matterId: transactionData.matterId,
      clientId: transactionData.clientId,
      authorizedBy: 'current-user',
      authorizedAt: new Date().toISOString(),
      authorizationReason: transactionData.authorizationReason,
      processedAt: new Date().toISOString(),
      processedBy: 'current-user',
      metadata: {
        ipAddress: '127.0.0.1',
        userAgent: 'Ross AI App',
        processingMethod: 'manual'
      },
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save transaction
    const transactions = this.loadTransactions();
    transactions.push(transaction);
    this.saveTransactions(transactions);

    // Update account balance
    await this.updateAccount(trustAccountId, {
      currentBalance: newBalance,
      availableBalance: newBalance,
      lastActivity: new Date().toISOString()
    });

    // Check for low balance alerts
    if (newBalance < account.minimumBalance) {
      await this.createAlert(trustAccountId, {
        type: 'low_balance',
        severity: 'high',
        title: 'Low Balance Alert',
        message: `Trust account balance ($${newBalance.toFixed(2)}) is below minimum threshold ($${account.minimumBalance.toFixed(2)})`,
        threshold: account.minimumBalance,
        currentValue: newBalance
      });
    }

    // Create audit log entry
    await this.createAuditLogEntry({
      action: transaction.type,
      entity: 'transaction',
      entityId: transaction.id,
      trustAccountId,
      userId: 'current-user',
      userName: 'Current User',
      userRole: 'attorney',
      ipAddress: '127.0.0.1',
      userAgent: 'Ross AI App',
      newValues: transaction,
      reason: transactionData.authorizationReason,
      metadata: {
        amount: transactionData.amount,
        type: transactionData.type,
        account: account.accountNumber
      }
    });

    return transaction;
  }

  static async transferFunds(
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    description: string,
    authorizationReason: string
  ): Promise<{ withdrawalTxn: TrustTransaction; depositTxn: TrustTransaction }> {
    const fromAccount = await this.getAccount(fromAccountId);
    const toAccount = await this.getAccount(toAccountId);

    if (!fromAccount || !toAccount) {
      throw new Error('One or both accounts not found');
    }

    if (fromAccount.currentBalance < amount) {
      throw new Error('Insufficient funds for transfer');
    }

    const batchId = `batch-${Date.now()}`;

    // Create withdrawal transaction
    const withdrawalTxn = await this.createTransaction(fromAccountId, {
      type: 'withdrawal',
      amount,
      description: `Transfer to ${toAccount.accountName} - ${description}`,
      reference: `TXF-${batchId}`,
      authorizationReason
    });

    // Create deposit transaction
    const depositTxn = await this.createTransaction(toAccountId, {
      type: 'deposit',
      amount,
      description: `Transfer from ${fromAccount.accountName} - ${description}`,
      reference: `TXF-${batchId}`,
      authorizationReason
    });

    // Update transactions with transfer information
    const transactions = this.loadTransactions();
    const withdrawalIndex = transactions.findIndex(t => t.id === withdrawalTxn.id);
    const depositIndex = transactions.findIndex(t => t.id === depositTxn.id);

    if (withdrawalIndex !== -1) {
      transactions[withdrawalIndex].transferType = 'trust_to_trust';
      transactions[withdrawalIndex].toAccountId = toAccountId;
      transactions[withdrawalIndex].batchId = batchId;
    }

    if (depositIndex !== -1) {
      transactions[depositIndex].transferType = 'trust_to_trust';
      transactions[depositIndex].fromAccountId = fromAccountId;
      transactions[depositIndex].batchId = batchId;
    }

    this.saveTransactions(transactions);

    return { withdrawalTxn: transactions[withdrawalIndex], depositTxn: transactions[depositIndex] };
  }

  // Alert Management
  static async getAlerts(trustAccountId?: string): Promise<TrustAccountAlert[]> {
    const alerts = this.loadAlerts();
    
    if (trustAccountId) {
      return alerts.filter(alert => alert.trustAccountId === trustAccountId && alert.isActive);
    }
    
    return alerts.filter(alert => alert.isActive);
  }

  static async createAlert(
    trustAccountId: string,
    alertData: {
      type: TrustAccountAlert['type'];
      severity: TrustAccountAlert['severity'];
      title: string;
      message: string;
      threshold?: number;
      currentValue?: number;
    }
  ): Promise<TrustAccountAlert> {
    const alert: TrustAccountAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      trustAccountId,
      type: alertData.type,
      severity: alertData.severity,
      title: alertData.title,
      message: alertData.message,
      threshold: alertData.threshold,
      currentValue: alertData.currentValue,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const alerts = this.loadAlerts();
    alerts.push(alert);
    this.saveAlerts(alerts);

    return alert;
  }

  static async resolveAlert(alertId: string, resolutionNotes: string): Promise<void> {
    const alerts = this.loadAlerts();
    const index = alerts.findIndex(alert => alert.id === alertId);
    
    if (index === -1) throw new Error('Alert not found');

    alerts[index].isActive = false;
    alerts[index].resolvedAt = new Date().toISOString();
    alerts[index].resolvedBy = 'current-user';
    alerts[index].resolutionNotes = resolutionNotes;

    this.saveAlerts(alerts);
  }

  // Reconciliation
  static async createReconciliation(
    trustAccountId: string,
    reconciliationData: {
      periodStart: string;
      periodEnd: string;
      statementId: string;
      statementDate: string;
      statementBalance: number;
    }
  ): Promise<TrustAccountReconciliation> {
    const account = await this.getAccount(trustAccountId);
    if (!account) throw new Error('Trust account not found');

    const reconciliation: TrustAccountReconciliation = {
      id: `recon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      trustAccountId,
      periodStart: reconciliationData.periodStart,
      periodEnd: reconciliationData.periodEnd,
      bookBalance: account.currentBalance,
      bankBalance: reconciliationData.statementBalance,
      difference: account.currentBalance - reconciliationData.statementBalance,
      status: Math.abs(account.currentBalance - reconciliationData.statementBalance) < 0.01 ? 'completed' : 'discrepancy',
      statementId: reconciliationData.statementId,
      statementDate: reconciliationData.statementDate,
      statementBalance: reconciliationData.statementBalance,
      reconciledTransactions: [],
      unreconciledTransactions: [],
      discrepancies: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const reconciliations = this.loadReconciliations();
    reconciliations.push(reconciliation);
    this.saveReconciliations(reconciliations);

    return reconciliation;
  }

  // Dashboard and Summary
  static async getSummary(): Promise<TrustAccountSummary> {
    const accounts = this.loadAccounts();
    const transactions = this.loadTransactions();
    const alerts = this.loadAlerts();

    const activeAccounts = accounts.filter(a => a.status === 'active');
    const totalBalance = accounts.reduce((sum, account) => sum + account.currentBalance, 0);
    const complianceRate = (accounts.filter(a => a.ioltaCompliant).length / Math.max(accounts.length, 1)) * 100;

    // Calculate monthly transactions (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const recentTransactions = transactions.filter(t => t.processedAt > thirtyDaysAgo);

    const monthlyDeposits = recentTransactions
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyWithdrawals = recentTransactions
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyTransfers = recentTransactions
      .filter(t => t.type === 'transfer')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalAccounts: accounts.length,
      activeAccounts: activeAccounts.length,
      totalBalance,
      averageBalance: totalBalance / Math.max(accounts.length, 1),
      complianceRate,
      monthlyTransactions: {
        deposits: monthlyDeposits,
        withdrawals: monthlyWithdrawals,
        transfers: monthlyTransfers,
        netChange: monthlyDeposits - monthlyWithdrawals
      },
      activeAlerts: alerts.filter(a => a.isActive).length,
      criticalAlerts: alerts.filter(a => a.isActive && a.severity === 'critical').length,
      overdueReconciliations: 0, // Would calculate based on reconciliation schedule
      compliantAccounts: accounts.filter(a => a.ioltaCompliant).length,
      violationCount: 0, // Would track compliance violations
      warningCount: alerts.filter(a => a.isActive && a.severity === 'medium').length
    };
  }

  // Compliance and Reporting
  static async generateComplianceReport(
    startDate: string,
    endDate: string,
    trustAccountId?: string
  ): Promise<IOLTAComplianceReport> {
    const accounts = trustAccountId 
      ? [await this.getAccount(trustAccountId)].filter(Boolean) as TrustAccount[]
      : this.loadAccounts();

    const totalBalance = accounts.reduce((sum, account) => sum + account.currentBalance, 0);
    const complianceScore = (accounts.filter(a => a.ioltaCompliant).length / Math.max(accounts.length, 1)) * 100;

    const report: IOLTAComplianceReport = {
      id: `report-${Date.now()}`,
      trustAccountId,
      reportPeriod: {
        startDate,
        endDate,
        year: new Date(endDate).getFullYear()
      },
      overallStatus: complianceScore >= 95 ? 'compliant' : complianceScore >= 80 ? 'warning' : 'violation',
      complianceScore,
      summary: {
        totalTrustBalance: totalBalance,
        averageBalance: totalBalance / Math.max(accounts.length, 1),
        interestEarned: 0, // Would calculate based on transactions
        interestDistributed: 0,
        totalDeposits: 0, // Would calculate from transactions in period
        totalWithdrawals: 0,
        accountCount: accounts.length
      },
      violations: [],
      warnings: [],
      requiredFilings: [],
      generatedAt: new Date().toISOString(),
      generatedBy: 'current-user',
      reportFiles: []
    };

    return report;
  }

  // Audit Trail
  private static async createAuditLogEntry(entry: Omit<TrustAccountAuditLog, 'id' | 'timestamp'>): Promise<void> {
    const auditLog = this.loadAuditLog();
    
    const logEntry: TrustAccountAuditLog = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    auditLog.unshift(logEntry);
    
    // Keep only last 1000 entries
    if (auditLog.length > 1000) {
      auditLog.splice(1000);
    }

    this.saveAuditLog(auditLog);
  }

  static async getAuditLog(trustAccountId?: string, limit: number = 50): Promise<TrustAccountAuditLog[]> {
    const auditLog = this.loadAuditLog();
    
    let filtered = auditLog;
    if (trustAccountId) {
      filtered = auditLog.filter(entry => entry.trustAccountId === trustAccountId);
    }

    return filtered.slice(0, limit);
  }

  // Storage Management
  private static loadAccounts(): TrustAccount[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) {
      const mockAccounts = this.generateMockAccounts();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mockAccounts));
      return mockAccounts;
    }
    return JSON.parse(stored);
  }

  private static saveAccounts(accounts: TrustAccount[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(accounts));
  }

  private static loadTransactions(): TrustTransaction[] {
    const stored = localStorage.getItem(this.TRANSACTIONS_KEY);
    if (!stored) {
      const mockTransactions = this.generateMockTransactions();
      localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(mockTransactions));
      return mockTransactions;
    }
    return JSON.parse(stored);
  }

  private static saveTransactions(transactions: TrustTransaction[]): void {
    localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(transactions));
  }

  private static loadAlerts(): TrustAccountAlert[] {
    const stored = localStorage.getItem(this.ALERTS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private static saveAlerts(alerts: TrustAccountAlert[]): void {
    localStorage.setItem(this.ALERTS_KEY, JSON.stringify(alerts));
  }

  private static loadReconciliations(): TrustAccountReconciliation[] {
    const stored = localStorage.getItem(this.RECONCILIATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private static saveReconciliations(reconciliations: TrustAccountReconciliation[]): void {
    localStorage.setItem(this.RECONCILIATIONS_KEY, JSON.stringify(reconciliations));
  }

  private static loadAuditLog(): TrustAccountAuditLog[] {
    const stored = localStorage.getItem(this.AUDIT_LOG_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private static saveAuditLog(auditLog: TrustAccountAuditLog[]): void {
    localStorage.setItem(this.AUDIT_LOG_KEY, JSON.stringify(auditLog));
  }

  // Mock Data Generation
  private static generateMockAccounts(): TrustAccount[] {
    const baseDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago

    return [
      {
        id: 'trust-001',
        clientId: 'client-001',
        clientName: 'Acme Corporation',
        matterId: 'matter-001',
        matterTitle: 'Corporate Acquisition',
        accountNumber: 'TA-2024-001',
        accountName: 'Acme Corp Trust Account',
        currentBalance: 125000.00,
        availableBalance: 125000.00,
        pendingBalance: 0,
        reservedBalance: 0,
        bankName: 'First National Trust Bank',
        routingNumber: '123456789',
        accountType: 'checking',
        currency: 'USD',
        status: 'active',
        ioltaCompliant: true,
        requiresIOLTA: true,
        minimumBalance: 1000.00,
        openedDate: baseDate.toISOString(),
        lastActivity: new Date().toISOString(),
        createdAt: baseDate.toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'attorney-001',
        purpose: 'Escrow for corporate acquisition transaction',
        tags: ['acquisition', 'corporate', 'high-value']
      },
      {
        id: 'trust-002',
        clientId: 'client-002',
        clientName: 'Smith Family Trust',
        matterId: 'matter-002',
        matterTitle: 'Estate Planning',
        accountNumber: 'TA-2024-002',
        accountName: 'Smith Estate Trust Account',
        currentBalance: 45000.00,
        availableBalance: 45000.00,
        pendingBalance: 0,
        reservedBalance: 0,
        bankName: 'Trust & Savings Bank',
        routingNumber: '987654321',
        accountType: 'savings',
        currency: 'USD',
        status: 'active',
        ioltaCompliant: true,
        requiresIOLTA: true,
        minimumBalance: 500.00,
        openedDate: new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'attorney-001',
        purpose: 'Trust administration and estate settlement',
        tags: ['estate', 'family', 'trust-administration']
      }
    ];
  }

  private static generateMockTransactions(): TrustTransaction[] {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return [
      {
        id: 'txn-001',
        trustAccountId: 'trust-001',
        type: 'deposit',
        amount: 125000.00,
        runningBalance: 125000.00,
        description: 'Initial escrow deposit for Acme acquisition',
        reference: 'ACQ-2024-001',
        matterId: 'matter-001',
        clientId: 'client-001',
        authorizedBy: 'attorney-001',
        authorizedAt: thirtyDaysAgo.toISOString(),
        authorizationReason: 'Escrow deposit per purchase agreement',
        processedAt: thirtyDaysAgo.toISOString(),
        processedBy: 'attorney-001',
        metadata: {
          ipAddress: '192.168.1.100',
          userAgent: 'Ross AI App',
          processingMethod: 'wire_transfer',
          wireReference: 'WIRE-2024-001'
        },
        attachments: [],
        createdAt: thirtyDaysAgo.toISOString(),
        updatedAt: thirtyDaysAgo.toISOString()
      },
      {
        id: 'txn-002',
        trustAccountId: 'trust-002',
        type: 'deposit',
        amount: 50000.00,
        runningBalance: 50000.00,
        description: 'Estate settlement funds deposit',
        reference: 'EST-2024-001',
        matterId: 'matter-002',
        clientId: 'client-002',
        authorizedBy: 'attorney-001',
        authorizedAt: new Date(thirtyDaysAgo.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        authorizationReason: 'Estate executor authorization',
        processedAt: new Date(thirtyDaysAgo.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        processedBy: 'attorney-001',
        metadata: {
          ipAddress: '192.168.1.101',
          userAgent: 'Ross AI App',
          processingMethod: 'check_deposit',
          checkNumber: '1001'
        },
        attachments: [],
        createdAt: new Date(thirtyDaysAgo.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(thirtyDaysAgo.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'txn-003',
        trustAccountId: 'trust-002',
        type: 'withdrawal',
        amount: 5000.00,
        runningBalance: 45000.00,
        description: 'Estate administration fees payment',
        reference: 'FEE-2024-001',
        matterId: 'matter-002',
        clientId: 'client-002',
        authorizedBy: 'attorney-001',
        authorizedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        authorizationReason: 'Court-approved administration fees',
        processedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        processedBy: 'attorney-001',
        metadata: {
          ipAddress: '192.168.1.102',
          userAgent: 'Ross AI App',
          processingMethod: 'wire_transfer',
          courtOrder: 'CO-2024-EST-002'
        },
        attachments: [],
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }
}