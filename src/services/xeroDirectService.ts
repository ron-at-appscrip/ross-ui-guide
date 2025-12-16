/**
 * Direct Xero API Service
 * This service bypasses OAuth and uses direct API credentials
 * FOR DEVELOPMENT USE ONLY - NOT SECURE FOR PRODUCTION
 */

import { XeroContact, XeroInvoice } from '@/types/xero';
import { Client } from '@/types/client';
import { Invoice } from '@/types/billing';

export class XeroDirectService {
  private static baseUrl = 'https://api.xero.com/api.xro/2.0';
  
  // For development: Use a pre-generated access token
  // You can get this from Xero API Previewer or by completing OAuth once
  private static accessToken = import.meta.env.VITE_XERO_ACCESS_TOKEN || '';
  private static tenantId = import.meta.env.VITE_XERO_TENANT_ID || '';

  static isConfigured(): boolean {
    return !!(this.accessToken && this.tenantId);
  }

  static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.isConfigured()) {
      throw new Error('Xero Direct Service not configured. Add VITE_XERO_ACCESS_TOKEN and VITE_XERO_TENANT_ID to .env');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Xero-tenant-id': this.tenantId,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Xero API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Mock implementations that return sample data
  static async getContacts(): Promise<XeroContact[]> {
    if (!this.isConfigured()) {
      // Return mock data for development
      return [
        {
          ContactID: 'mock-1',
          Name: 'Acme Corporation',
          FirstName: 'John',
          LastName: 'Doe',
          EmailAddress: 'john@acme.com',
          ContactStatus: 'ACTIVE',
          IsCustomer: true
        },
        {
          ContactID: 'mock-2',
          Name: 'Tech Startup Inc',
          FirstName: 'Jane',
          LastName: 'Smith',
          EmailAddress: 'jane@techstartup.com',
          ContactStatus: 'ACTIVE',
          IsCustomer: true
        }
      ];
    }

    try {
      const response = await this.makeRequest<{ Contacts: XeroContact[] }>('/Contacts');
      return response.Contacts || [];
    } catch (error) {
      console.error('Error fetching contacts:', error);
      // Return mock data on error
      return [];
    }
  }

  static async getInvoices(): Promise<XeroInvoice[]> {
    if (!this.isConfigured()) {
      // Return mock data for development
      return [
        {
          InvoiceID: 'mock-inv-1',
          InvoiceNumber: 'INV-0001',
          Type: 'ACCREC',
          Contact: { ContactID: 'mock-1', Name: 'Acme Corporation' },
          Date: '2024-01-15',
          DueDate: '2024-02-15',
          Status: 'AUTHORISED',
          LineAmountTypes: 'Exclusive',
          LineItems: [],
          SubTotal: 5000,
          TotalTax: 500,
          Total: 5500,
          AmountDue: 5500,
          AmountPaid: 0,
          CurrencyCode: 'USD'
        }
      ];
    }

    try {
      const response = await this.makeRequest<{ Invoices: XeroInvoice[] }>('/Invoices');
      return response.Invoices || [];
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }
  }

  // Simple sync simulation
  static async syncClient(client: Client): Promise<boolean> {
    console.log('Syncing client to Xero:', client.name);
    
    if (!this.isConfigured()) {
      console.log('Dev mode: Mock sync successful');
      return true;
    }

    try {
      const contact = {
        Name: client.name,
        FirstName: client.type === 'person' ? client.name.split(' ')[0] : undefined,
        LastName: client.type === 'person' ? client.name.split(' ').slice(1).join(' ') : undefined,
        EmailAddress: client.emails.find(e => e.isPrimary)?.value,
        IsCustomer: true
      };

      await this.makeRequest('/Contacts', {
        method: 'POST',
        body: JSON.stringify({ Contacts: [contact] })
      });

      return true;
    } catch (error) {
      console.error('Error syncing client:', error);
      return false;
    }
  }

  static async syncInvoice(invoice: Invoice): Promise<boolean> {
    console.log('Syncing invoice to Xero:', invoice.number);
    
    if (!this.isConfigured()) {
      console.log('Dev mode: Mock sync successful');
      return true;
    }

    try {
      const xeroInvoice = {
        Type: 'ACCREC',
        Contact: { Name: invoice.clientName },
        Date: invoice.issueDate.split('T')[0],
        DueDate: invoice.dueDate.split('T')[0],
        InvoiceNumber: invoice.number,
        LineItems: invoice.timeEntries.map(entry => ({
          Description: entry.description,
          Quantity: entry.hours,
          UnitAmount: entry.rate,
          AccountCode: '200'
        }))
      };

      await this.makeRequest('/Invoices', {
        method: 'POST',
        body: JSON.stringify({ Invoices: [xeroInvoice] })
      });

      return true;
    } catch (error) {
      console.error('Error syncing invoice:', error);
      return false;
    }
  }
}