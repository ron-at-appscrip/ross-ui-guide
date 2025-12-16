import {
  XeroConfig,
  XeroTokenResponse,
  XeroTenant,
  XeroContact,
  XeroInvoice,
  XeroPayment,
  XeroAccount,
  XeroItem,
  XeroInvoicesResponse,
  XeroPaymentsResponse,
  XeroContactsResponse,
  XeroAccountsResponse,
  XeroItemsResponse,
  XeroTenantsResponse,
  XeroIntegrationSettings,
  XeroSyncResult,
  XeroSyncStatus
} from '@/types/xero';
import { Invoice, TimeEntry, Payment } from '@/types/billing';
import { Client } from '@/types/client';

export class XeroService {
  private static config: XeroConfig = {
    clientId: import.meta.env.VITE_XERO_CLIENT_ID || '', // To be provided by user
    clientSecret: import.meta.env.VITE_XERO_CLIENT_SECRET || '', // To be provided by user
    redirectUri: import.meta.env.VITE_XERO_REDIRECT_URI || 'http://localhost:8080/auth/xero/callback',
    scope: 'openid profile email accounting.transactions accounting.contacts accounting.settings offline_access',
    tenantId: import.meta.env.VITE_XERO_TENANT_ID || '' // To be provided by user
  };

  private static baseUrl = 'https://api.xero.com/api.xro/2.0';
  private static authUrl = 'https://login.xero.com/identity';

  // Configuration Methods
  static setConfig(config: Partial<XeroConfig>) {
    this.config = { ...this.config, ...config };
  }

  static getConfig(): XeroConfig {
    return { ...this.config };
  }

  static isConfigured(): boolean {
    return !!(this.config.clientId && this.config.clientSecret);
  }

  // Authentication Methods
  static getAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scope,
      ...(state && { state })
    });

    return `${this.authUrl}/connect/authorize?${params.toString()}`;
  }

  static async exchangeCodeForTokens(code: string, state?: string): Promise<XeroTokenResponse> {
    try {
      const response = await fetch(`${this.authUrl}/connect/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.config.clientId}:${this.config.clientSecret}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.config.redirectUri
        })
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }

      const tokens: XeroTokenResponse = await response.json();
      
      // Store tokens securely (in production, use secure storage)
      localStorage.setItem('xero_access_token', tokens.access_token);
      if (tokens.refresh_token) {
        localStorage.setItem('xero_refresh_token', tokens.refresh_token);
      }

      return tokens;
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw error;
    }
  }

  static async refreshAccessToken(): Promise<XeroTokenResponse | null> {
    try {
      const refreshToken = localStorage.getItem('xero_refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${this.authUrl}/connect/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.config.clientId}:${this.config.clientSecret}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        })
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      const tokens: XeroTokenResponse = await response.json();
      
      // Update stored tokens
      localStorage.setItem('xero_access_token', tokens.access_token);
      if (tokens.refresh_token) {
        localStorage.setItem('xero_refresh_token', tokens.refresh_token);
      }

      return tokens;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      return null;
    }
  }

  // API Request Helper
  private static async makeApiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const accessToken = localStorage.getItem('xero_access_token');
    if (!accessToken) {
      throw new Error('No access token available. Please authenticate first.');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Xero-Tenant-Id': this.config.tenantId || '',
        ...options.headers
      }
    });

    if (response.status === 401) {
      // Try to refresh token
      const newTokens = await this.refreshAccessToken();
      if (newTokens) {
        // Retry request with new token
        return this.makeApiRequest(endpoint, options);
      } else {
        throw new Error('Authentication failed. Please re-authenticate.');
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  // Tenant Methods
  static async getTenants(): Promise<XeroTenant[]> {
    try {
      const response = await fetch(`${this.authUrl}/connect/tenants`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('xero_access_token')}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tenants');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching tenants:', error);
      throw error;
    }
  }

  static setTenant(tenantId: string) {
    this.config.tenantId = tenantId;
  }

  // Contact Methods
  static async getContacts(): Promise<XeroContact[]> {
    try {
      const response: XeroContactsResponse = await this.makeApiRequest('/Contacts');
      return response.Contacts || [];
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  }

  static async createContact(contact: Omit<XeroContact, 'ContactID'>): Promise<XeroContact> {
    try {
      const response: XeroContactsResponse = await this.makeApiRequest('/Contacts', {
        method: 'POST',
        body: JSON.stringify({ Contacts: [contact] })
      });

      if (response.Contacts && response.Contacts.length > 0) {
        return response.Contacts[0];
      }
      throw new Error('Failed to create contact');
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }

  static async updateContact(contactId: string, contact: Partial<XeroContact>): Promise<XeroContact> {
    try {
      const response: XeroContactsResponse = await this.makeApiRequest(`/Contacts/${contactId}`, {
        method: 'POST',
        body: JSON.stringify({ Contacts: [{ ...contact, ContactID: contactId }] })
      });

      if (response.Contacts && response.Contacts.length > 0) {
        return response.Contacts[0];
      }
      throw new Error('Failed to update contact');
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  }

  // Invoice Methods
  static async getInvoices(modifiedAfter?: string): Promise<XeroInvoice[]> {
    try {
      let endpoint = '/Invoices';
      if (modifiedAfter) {
        endpoint += `?modifiedAfter=${modifiedAfter}`;
      }
      
      const response: XeroInvoicesResponse = await this.makeApiRequest(endpoint);
      return response.Invoices || [];
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  static async createInvoice(invoice: Omit<XeroInvoice, 'InvoiceID'>): Promise<XeroInvoice> {
    try {
      const response: XeroInvoicesResponse = await this.makeApiRequest('/Invoices', {
        method: 'POST',
        body: JSON.stringify({ Invoices: [invoice] })
      });

      if (response.Invoices && response.Invoices.length > 0) {
        return response.Invoices[0];
      }
      throw new Error('Failed to create invoice');
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  static async updateInvoice(invoiceId: string, invoice: Partial<XeroInvoice>): Promise<XeroInvoice> {
    try {
      const response: XeroInvoicesResponse = await this.makeApiRequest(`/Invoices/${invoiceId}`, {
        method: 'POST',
        body: JSON.stringify({ Invoices: [{ ...invoice, InvoiceID: invoiceId }] })
      });

      if (response.Invoices && response.Invoices.length > 0) {
        return response.Invoices[0];
      }
      throw new Error('Failed to update invoice');
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  }

  static async emailInvoice(invoiceId: string): Promise<boolean> {
    try {
      await this.makeApiRequest(`/Invoices/${invoiceId}/Email`, {
        method: 'POST'
      });
      return true;
    } catch (error) {
      console.error('Error emailing invoice:', error);
      return false;
    }
  }

  // Payment Methods
  static async getPayments(modifiedAfter?: string): Promise<XeroPayment[]> {
    try {
      let endpoint = '/Payments';
      if (modifiedAfter) {
        endpoint += `?modifiedAfter=${modifiedAfter}`;
      }
      
      const response: XeroPaymentsResponse = await this.makeApiRequest(endpoint);
      return response.Payments || [];
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  }

  static async createPayment(payment: Omit<XeroPayment, 'PaymentID'>): Promise<XeroPayment> {
    try {
      const response: XeroPaymentsResponse = await this.makeApiRequest('/Payments', {
        method: 'POST',
        body: JSON.stringify({ Payments: [payment] })
      });

      if (response.Payments && response.Payments.length > 0) {
        return response.Payments[0];
      }
      throw new Error('Failed to create payment');
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  // Account Methods
  static async getAccounts(): Promise<XeroAccount[]> {
    try {
      const response: XeroAccountsResponse = await this.makeApiRequest('/Accounts');
      return response.Accounts || [];
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw error;
    }
  }

  // Item Methods
  static async getItems(): Promise<XeroItem[]> {
    try {
      const response: XeroItemsResponse = await this.makeApiRequest('/Items');
      return response.Items || [];
    } catch (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
  }

  // Data Conversion Methods
  static convertClientToXeroContact(client: Client): Omit<XeroContact, 'ContactID'> {
    return {
      Name: client.name,
      FirstName: client.type === 'person' ? client.name.split(' ')[0] : undefined,
      LastName: client.type === 'person' ? client.name.split(' ').slice(1).join(' ') : undefined,
      EmailAddress: client.emails.find(e => e.isPrimary)?.value,
      ContactStatus: client.status === 'active' ? 'ACTIVE' : 'ARCHIVED',
      IsCustomer: true,
      IsSupplier: false,
      Addresses: client.addresses?.map(addr => ({
        AddressType: 'STREET' as const,
        AddressLine1: addr.line1,
        AddressLine2: addr.line2,
        City: addr.city,
        Region: addr.state,
        PostalCode: addr.postalCode,
        Country: addr.country
      })),
      Phones: client.phones?.map(phone => ({
        PhoneType: phone.type === 'mobile' ? 'MOBILE' as const : 'DEFAULT' as const,
        PhoneNumber: phone.value
      }))
    };
  }

  static convertInvoiceToXero(
    invoice: Invoice,
    xeroContactId: string,
    accountCode?: string
  ): Omit<XeroInvoice, 'InvoiceID'> {
    return {
      Type: 'ACCREC',
      Contact: {
        ContactID: xeroContactId
      },
      Date: invoice.issueDate.split('T')[0],
      DueDate: invoice.dueDate.split('T')[0],
      InvoiceNumber: invoice.number,
      Reference: `Ross AI Invoice - ${invoice.number}`,
      Status: 'DRAFT',
      LineAmountTypes: 'Exclusive',
      CurrencyCode: 'USD',
      LineItems: invoice.timeEntries.map(entry => ({
        Description: entry.description,
        Quantity: entry.hours,
        UnitAmount: entry.rate,
        AccountCode: accountCode || '200', // Default revenue account
        TaxType: 'NONE'
      }))
    };
  }

  static convertPaymentToXero(
    payment: Payment,
    xeroInvoiceId: string,
    accountId: string
  ): Omit<XeroPayment, 'PaymentID'> {
    return {
      Invoice: {
        InvoiceID: xeroInvoiceId
      },
      Account: {
        AccountID: accountId
      },
      Date: payment.paymentDate.split('T')[0],
      Amount: payment.amount,
      Reference: payment.notes || 'Payment from Ross AI'
    };
  }

  // Sync Methods
  static async syncClientsToContacts(clients: Client[]): Promise<XeroSyncResult> {
    const startTime = new Date();
    const errors: string[] = [];
    let itemsProcessed = 0;

    try {
      const existingContacts = await this.getContacts();
      const existingContactsMap = new Map(
        existingContacts.map(contact => [contact.Name?.toLowerCase(), contact])
      );

      for (const client of clients) {
        try {
          const existingContact = existingContactsMap.get(client.name.toLowerCase());
          const xeroContact = this.convertClientToXeroContact(client);

          if (existingContact) {
            await this.updateContact(existingContact.ContactID!, xeroContact);
          } else {
            await this.createContact(xeroContact);
          }
          itemsProcessed++;
        } catch (error) {
          errors.push(`Failed to sync client ${client.name}: ${error}`);
        }
      }

      return {
        status: errors.length > 0 ? 'error' : 'success',
        message: `Synced ${itemsProcessed} clients to Xero${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
        timestamp: new Date().toISOString(),
        itemsProcessed,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Sync failed: ${error}`,
        timestamp: new Date().toISOString(),
        itemsProcessed,
        errors: [String(error)]
      };
    }
  }

  static async syncInvoicesToXero(invoices: Invoice[]): Promise<XeroSyncResult> {
    const errors: string[] = [];
    let itemsProcessed = 0;

    try {
      // Get contacts for mapping
      const xeroContacts = await this.getContacts();
      const contactsMap = new Map(
        xeroContacts.map(contact => [contact.Name?.toLowerCase(), contact.ContactID!])
      );

      for (const invoice of invoices) {
        try {
          const xeroContactId = contactsMap.get(invoice.clientName.toLowerCase());
          if (!xeroContactId) {
            errors.push(`No Xero contact found for client: ${invoice.clientName}`);
            continue;
          }

          const xeroInvoice = this.convertInvoiceToXero(invoice, xeroContactId);
          await this.createInvoice(xeroInvoice);
          itemsProcessed++;
        } catch (error) {
          errors.push(`Failed to sync invoice ${invoice.number}: ${error}`);
        }
      }

      return {
        status: errors.length > 0 ? 'error' : 'success',
        message: `Synced ${itemsProcessed} invoices to Xero${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
        timestamp: new Date().toISOString(),
        itemsProcessed,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Invoice sync failed: ${error}`,
        timestamp: new Date().toISOString(),
        itemsProcessed,
        errors: [String(error)]
      };
    }
  }

  // Settings Management
  static getIntegrationSettings(): XeroIntegrationSettings {
    const settings = localStorage.getItem('xero_integration_settings');
    if (settings) {
      return JSON.parse(settings);
    }

    // Default settings
    const defaultSettings: XeroIntegrationSettings = {
      isEnabled: false,
      autoSync: false,
      syncFrequency: 'daily',
      defaultCurrency: 'USD',
      contactSyncEnabled: true,
      paymentSyncEnabled: true
    };

    localStorage.setItem('xero_integration_settings', JSON.stringify(defaultSettings));
    return defaultSettings;
  }

  static saveIntegrationSettings(settings: XeroIntegrationSettings): void {
    localStorage.setItem('xero_integration_settings', JSON.stringify(settings));
  }

  static async testConnection(): Promise<boolean> {
    try {
      await this.getAccounts();
      return true;
    } catch (error) {
      console.error('Xero connection test failed:', error);
      return false;
    }
  }

  static async getConnectionStatus(): Promise<{
    isConnected: boolean;
    tenantName?: string;
    lastSync?: string;
  }> {
    try {
      const isConnected = await this.testConnection();
      const settings = this.getIntegrationSettings();
      
      if (isConnected && this.config.tenantId) {
        const tenants = await this.getTenants();
        const currentTenant = tenants.find(t => t.tenantId === this.config.tenantId);
        
        return {
          isConnected: true,
          tenantName: currentTenant?.tenantName,
          lastSync: settings.lastSyncDate
        };
      }

      return { isConnected: false };
    } catch (error) {
      return { isConnected: false };
    }
  }
}