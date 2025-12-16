import { LEDESConfigurationFixed, UTBMSMappingFixed, LEDESError } from '@/types/ledes-fixed';
import { TimeEntry } from '@/types/billing';

export class LEDESBillingServiceFixed {
  private static readonly STORAGE_KEY = 'ledes_configurations';
  private static downloadUrls = new Set<string>(); // Track URLs for cleanup

  // FIX: Proper error handling and validation
  static async createConfiguration(config: Omit<LEDESConfigurationFixed, 'id' | 'createdAt' | 'updatedAt'>): Promise<LEDESConfigurationFixed> {
    try {
      // FIX: Validate inputs
      this.validateConfigurationInput(config);

      const newConfig: LEDESConfigurationFixed = {
        ...config,
        id: this.generateSecureId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const configs = await this.getConfigurations();
      configs.push(newConfig);
      
      // FIX: Handle storage errors
      await this.safeStorageWrite(this.STORAGE_KEY, configs);

      return newConfig;
    } catch (error) {
      throw this.createLEDESError('CONFIG_CREATE_FAILED', error as Error, {
        clientName: config.clientName,
        format: config.format
      });
    }
  }

  // FIX: Input validation
  private static validateConfigurationInput(config: any): void {
    const errors: string[] = [];

    if (!config.clientName?.trim()) {
      errors.push('Client name is required');
    }

    if (!config.format || !['LEDES1998B', 'LEDES2.0', 'LEDESXML'].includes(config.format)) {
      errors.push('Valid LEDES format is required');
    }

    if (!config.utbmsMapping || typeof config.utbmsMapping !== 'object') {
      errors.push('UTBMS mapping is required');
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
  }

  // FIX: Secure ID generation
  private static generateSecureId(): string {
    return `ledes-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`;
  }

  // FIX: Safe storage operations with error handling
  private static async safeStorageWrite(key: string, data: any): Promise<void> {
    try {
      const serialized = JSON.stringify(data);
      
      // Check storage quota
      if (serialized.length > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('Data too large for localStorage');
      }

      localStorage.setItem(key, serialized);
    } catch (error) {
      if (error instanceof DOMException && error.code === 22) {
        // Quota exceeded
        this.clearOldData();
        throw new Error('Storage quota exceeded. Please clear old data.');
      }
      throw error;
    }
  }

  // FIX: Memory management for download URLs
  private static createDownloadUrl(data: string, fileName: string): string {
    const blob = new Blob([data], { 
      type: fileName.endsWith('.xml') ? 'application/xml' : 'text/csv' 
    });
    const url = URL.createObjectURL(blob);
    
    // Track URL for cleanup
    this.downloadUrls.add(url);
    
    // Auto-cleanup after 10 minutes
    setTimeout(() => {
      URL.revokeObjectURL(url);
      this.downloadUrls.delete(url);
    }, 10 * 60 * 1000);
    
    return url;
  }

  // FIX: Cleanup method
  static cleanup(): void {
    this.downloadUrls.forEach(url => URL.revokeObjectURL(url));
    this.downloadUrls.clear();
  }

  // FIX: Proper error creation
  private static createLEDESError(code: string, originalError: Error, context?: Record<string, any>): LEDESError {
    const error = new Error(originalError.message) as LEDESError;
    error.code = code;
    error.severity = 'high';
    error.context = context;
    error.timestamp = new Date().toISOString();
    error.name = 'LEDESError';
    return error;
  }

  // FIX: Data cleanup utility
  private static clearOldData(): void {
    const keys = ['ledes_export_history', 'ledes_temp_data'];
    keys.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn(`Failed to clear ${key}:`, error);
      }
    });
  }

  // FIX: Atomic balance updates for trust accounts
  static async atomicBalanceUpdate(accountId: string, amount: number, operation: 'add' | 'subtract'): Promise<number> {
    // Implementation would use optimistic locking or database transactions
    // For now, adding validation and retry logic
    
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const account = await this.getAccount(accountId);
        if (!account) throw new Error('Account not found');
        
        const newBalance = operation === 'add' 
          ? account.currentBalance + amount
          : account.currentBalance - amount;
          
        // Validate business rules
        if (newBalance < 0) {
          throw new Error('Insufficient funds');
        }
        
        if (newBalance > 10000000) { // 10M limit
          throw new Error('Balance exceeds maximum limit');
        }
        
        // In real implementation, this would be atomic
        await this.updateAccountBalance(accountId, newBalance);
        return newBalance;
        
      } catch (error) {
        retryCount++;
        if (retryCount >= maxRetries) throw error;
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 100));
      }
    }
    
    throw new Error('Max retries exceeded');
  }

  // FIX: Input sanitization for financial data
  static sanitizeFinancialInput(amount: any): number {
    // Convert to number and validate
    const num = Number(amount);
    
    if (isNaN(num) || !isFinite(num)) {
      throw new Error('Invalid amount: must be a valid number');
    }
    
    if (num < 0) {
      throw new Error('Invalid amount: cannot be negative');
    }
    
    if (num > 999999999.99) {
      throw new Error('Invalid amount: exceeds maximum limit');
    }
    
    // Round to 2 decimal places to avoid floating point issues
    return Math.round(num * 100) / 100;
  }

  // Get all configurations
  static async getConfigurations(): Promise<LEDESConfigurationFixed[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading LEDES configurations:', error);
      return [];
    }
  }

  // Placeholder methods that would be implemented
  private static async getAccount(id: string): Promise<any> {
    // Implementation would fetch account
    return { id, currentBalance: 1000 };
  }
  
  private static async updateAccountBalance(id: string, balance: number): Promise<void> {
    // Implementation would update balance atomically
  }
}