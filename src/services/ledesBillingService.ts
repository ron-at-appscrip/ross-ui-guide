import {
  LEDESConfiguration,
  LEDESFormat,
  LEDES1998BRecord,
  LEDES20Record,
  LEDESXMLRecord,
  LEDESExportRequest,
  LEDESExportResult,
  LEDESValidationResult,
  LEDESValidationError,
  LEDESValidationWarning,
  UTBMSMapping,
  UTBMSActivityCode,
  UTBMSExpenseCode,
  UTBMSActivityDefinition,
  UTBMSExpenseDefinition,
  ClientBillingGuideline,
  LEDESComplianceReport,
  MockLEDESData
} from '@/types/ledes';
import { TimeEntry } from '@/types/billing';
import { BillingService } from './billingService';

export class LEDESBillingService {
  private static readonly STORAGE_KEY = 'ledes_configurations';
  private static readonly EXPORT_HISTORY_KEY = 'ledes_export_history';
  private static readonly GUIDELINES_KEY = 'client_billing_guidelines';

  // UTBMS Code Definitions
  private static readonly UTBMS_ACTIVITIES: UTBMSActivityDefinition[] = [
    {
      code: 'L100',
      description: 'Case Assessment, Development of Case Strategy, and Budgeting',
      category: 'case_assessment',
      examples: ['Initial case evaluation', 'Strategic planning', 'Budget preparation'],
      timeGuidelines: 'Initial assessment and planning activities'
    },
    {
      code: 'L110',
      description: 'Case Management and Administration',
      category: 'case_management',
      examples: ['File management', 'Scheduling', 'Administrative tasks'],
      timeGuidelines: 'Ongoing case administration'
    },
    {
      code: 'L200',
      description: 'Fact Investigation and Development',
      category: 'fact_investigation',
      examples: ['Witness interviews', 'Site inspections', 'Fact gathering'],
      timeGuidelines: 'Investigation and fact development'
    },
    {
      code: 'L300',
      description: 'Legal Research',
      category: 'legal_research',
      examples: ['Case law research', 'Statutory research', 'Legal memoranda'],
      timeGuidelines: 'Research activities'
    },
    {
      code: 'L400',
      description: 'Document and File Management, Review, and Production',
      category: 'document_review',
      examples: ['Document review', 'Production preparation', 'Discovery responses'],
      timeGuidelines: 'Document-related activities'
    },
    {
      code: 'L500',
      description: 'Pleadings, Motions, and Other Court Documents',
      category: 'document_drafting',
      examples: ['Motion drafting', 'Brief preparation', 'Pleading preparation'],
      timeGuidelines: 'Court document preparation'
    }
  ];

  private static readonly UTBMS_EXPENSES: UTBMSExpenseDefinition[] = [
    {
      code: 'E100',
      description: 'Court and Other Fees',
      category: 'court_fees',
      examples: ['Filing fees', 'Service fees', 'Court reporter fees'],
      requiresReceipt: true
    },
    {
      code: 'E110',
      description: 'Service of Process',
      category: 'service_fees',
      examples: ['Process server fees', 'Certified mail', 'Publication costs'],
      requiresReceipt: true
    },
    {
      code: 'E120',
      description: 'Investigation',
      category: 'investigation',
      examples: ['Private investigator fees', 'Background checks', 'Asset searches'],
      requiresReceipt: true
    },
    {
      code: 'E130',
      description: 'Experts',
      category: 'experts',
      examples: ['Expert witness fees', 'Consulting fees', 'Expert reports'],
      requiresReceipt: true
    },
    {
      code: 'E140',
      description: 'Technology',
      category: 'technology',
      examples: ['Legal database fees', 'Software licensing', 'E-discovery costs'],
      requiresReceipt: true
    },
    {
      code: 'E150',
      description: 'Travel',
      category: 'travel',
      examples: ['Airfare', 'Hotel expenses', 'Ground transportation'],
      requiresReceipt: true
    }
  ];

  // Configuration Management
  static async getConfigurations(): Promise<LEDESConfiguration[]> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) {
      // Initialize with mock data
      const mockConfigs = this.generateMockConfigurations();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mockConfigs));
      return mockConfigs;
    }
    return JSON.parse(stored);
  }

  static async getConfiguration(id: string): Promise<LEDESConfiguration | null> {
    const configs = await this.getConfigurations();
    return configs.find(c => c.id === id) || null;
  }

  static async createConfiguration(config: Omit<LEDESConfiguration, 'id' | 'createdAt' | 'updatedAt'>): Promise<LEDESConfiguration> {
    const newConfig: LEDESConfiguration = {
      ...config,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const configs = await this.getConfigurations();
    configs.push(newConfig);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configs));

    return newConfig;
  }

  static async updateConfiguration(id: string, updates: Partial<LEDESConfiguration>): Promise<LEDESConfiguration> {
    const configs = await this.getConfigurations();
    const index = configs.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error('Configuration not found');
    }

    configs[index] = {
      ...configs[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configs));
    return configs[index];
  }

  static async deleteConfiguration(id: string): Promise<void> {
    const configs = await this.getConfigurations();
    const filtered = configs.filter(c => c.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  // Export Functionality
  static async exportToLEDES(request: LEDESExportRequest): Promise<LEDESExportResult> {
    try {
      const config = await this.getConfiguration(request.configurationId);
      if (!config) {
        throw new Error('Configuration not found');
      }

      // Get time entries based on filters
      const timeEntries = await this.getFilteredTimeEntries(request.filters);
      
      // Validate data
      const validationResult = await this.validateExportData(timeEntries, config);
      
      if (!validationResult.isValid && validationResult.errors.some(e => e.severity === 'critical')) {
        return {
          success: false,
          fileName: '',
          recordCount: 0,
          totalAmount: 0,
          format: request.format,
          exportDate: new Date().toISOString(),
          validationResult,
          errors: validationResult.errors.map(e => e.message)
        };
      }

      // Generate export data based on format
      let exportData: string;
      let fileName: string;
      
      switch (request.format) {
        case 'LEDES1998B':
          exportData = await this.generateLEDES1998B(timeEntries, config, request);
          fileName = `LEDES_1998B_${config.clientName}_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'LEDES2.0':
          exportData = await this.generateLEDES20(timeEntries, config, request);
          fileName = `LEDES_2.0_${config.clientName}_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'LEDESXML':
          exportData = await this.generateLEDESXML(timeEntries, config, request);
          fileName = `LEDES_XML_${config.clientName}_${new Date().toISOString().split('T')[0]}.xml`;
          break;
        default:
          throw new Error('Unsupported LEDES format');
      }

      // Save to export history
      const exportResult: LEDESExportResult = {
        success: true,
        fileName,
        recordCount: timeEntries.length,
        totalAmount: timeEntries.reduce((sum, entry) => sum + entry.amount, 0),
        format: request.format,
        exportDate: new Date().toISOString(),
        validationResult,
        downloadUrl: this.createDownloadUrl(exportData, fileName)
      };

      await this.saveExportHistory(exportResult);
      return exportResult;

    } catch (error) {
      console.error('LEDES export error:', error);
      return {
        success: false,
        fileName: '',
        recordCount: 0,
        totalAmount: 0,
        format: request.format,
        exportDate: new Date().toISOString(),
        validationResult: {
          isValid: false,
          errors: [{
            id: Date.now().toString(),
            recordNumber: 0,
            field: 'export',
            value: null,
            rule: 'export_error',
            message: error instanceof Error ? error.message : 'Unknown export error',
            severity: 'critical'
          }],
          warnings: [],
          recordCount: 0,
          totalAmount: 0
        },
        errors: [error instanceof Error ? error.message : 'Unknown export error']
      };
    }
  }

  // Format-specific generators
  private static async generateLEDES1998B(
    timeEntries: TimeEntry[],
    config: LEDESConfiguration,
    request: LEDESExportRequest
  ): Promise<string> {
    const records: LEDES1998BRecord[] = [];
    const invoiceDate = new Date().toISOString().split('T')[0].replace(/-/g, '/');
    const invoiceNumber = `INV-${Date.now()}`;

    timeEntries.forEach((entry, index) => {
      const activityCode = this.mapToUTBMSActivity(entry.activityType || 'general_work', config.utbmsMapping);
      
      const record: LEDES1998BRecord = {
        INVOICE_DATE: invoiceDate,
        INVOICE_NUMBER: invoiceNumber,
        CLIENT_MATTER_NUMBER: entry.matterId,
        LAW_FIRM_MATTER_ID: entry.matterId,
        INVOICE_TOTAL: timeEntries.reduce((sum, e) => sum + e.amount, 0),
        BILLING_START_DATE: request.filters.dateRange.startDate.replace(/-/g, '/'),
        BILLING_END_DATE: request.filters.dateRange.endDate.replace(/-/g, '/'),
        INVOICE_DESCRIPTION: `Professional Services for ${entry.clientName}`,
        LINE_ITEM_NUMBER: index + 1,
        EXP_FEE_INV_ADJ_TYPE: 'F',
        LINE_ITEM_NUMBER_OF_UNITS: entry.hours,
        LINE_ITEM_UNIT_COST: entry.rate,
        LINE_ITEM_TOTAL: entry.amount,
        LINE_ITEM_DATE: entry.date.replace(/-/g, '/'),
        LINE_ITEM_TASK_CODE: 'T001',
        LINE_ITEM_ACTIVITY_CODE: activityCode,
        TIMEKEEPER_ID: entry.userId || 'TK001',
        LINE_ITEM_DESCRIPTION: entry.description,
        LAW_FIRM_NAME: 'Ross AI Legal Services',
        BILLING_ATTORNEY: 'John Doe',
        BILLING_ATTORNEY_ID: 'ATT001',
        TIMEKEEPER_NAME: 'John Doe',
        TIMEKEEPER_CLASSIFICATION: 'Attorney'
      };
      
      records.push(record);
    });

    return this.convertToCSV(records, this.getLEDES1998BHeaders());
  }

  private static async generateLEDES20(
    timeEntries: TimeEntry[],
    config: LEDESConfiguration,
    request: LEDESExportRequest
  ): Promise<string> {
    const records: LEDES20Record[] = [];
    const invoiceDate = new Date().toISOString().split('T')[0].replace(/-/g, '/');
    const invoiceNumber = `INV-${Date.now()}`;

    timeEntries.forEach((entry, index) => {
      const activityCode = this.mapToUTBMSActivity(entry.activityType || 'general_work', config.utbmsMapping);
      
      const record: LEDES20Record = {
        // Base LEDES 1998B fields
        INVOICE_DATE: invoiceDate,
        INVOICE_NUMBER: invoiceNumber,
        CLIENT_MATTER_NUMBER: entry.matterId,
        LAW_FIRM_MATTER_ID: entry.matterId,
        INVOICE_TOTAL: timeEntries.reduce((sum, e) => sum + e.amount, 0),
        BILLING_START_DATE: request.filters.dateRange.startDate.replace(/-/g, '/'),
        BILLING_END_DATE: request.filters.dateRange.endDate.replace(/-/g, '/'),
        INVOICE_DESCRIPTION: `Professional Services for ${entry.clientName}`,
        LINE_ITEM_NUMBER: index + 1,
        EXP_FEE_INV_ADJ_TYPE: 'F',
        LINE_ITEM_NUMBER_OF_UNITS: entry.hours,
        LINE_ITEM_UNIT_COST: entry.rate,
        LINE_ITEM_TOTAL: entry.amount,
        LINE_ITEM_DATE: entry.date.replace(/-/g, '/'),
        LINE_ITEM_TASK_CODE: 'T001',
        LINE_ITEM_ACTIVITY_CODE: activityCode,
        TIMEKEEPER_ID: entry.userId || 'TK001',
        LINE_ITEM_DESCRIPTION: entry.description,
        LAW_FIRM_NAME: 'Ross AI Legal Services',
        BILLING_ATTORNEY: 'John Doe',
        BILLING_ATTORNEY_ID: 'ATT001',
        TIMEKEEPER_NAME: 'John Doe',
        TIMEKEEPER_CLASSIFICATION: 'Attorney',
        
        // LEDES 2.0 specific fields
        CLIENT_ID: entry.clientId,
        MATTER_DESCRIPTION: entry.matterTitle,
        PRACTICE_AREA: 'General Practice',
        OFFICE_LOCATION: 'Main Office',
        CURRENCY_CODE: 'USD'
      };
      
      records.push(record);
    });

    return this.convertToCSV(records, this.getLEDES20Headers());
  }

  private static async generateLEDESXML(
    timeEntries: TimeEntry[],
    config: LEDESConfiguration,
    request: LEDESExportRequest
  ): Promise<string> {
    const xmlRecord: LEDESXMLRecord = {
      header: {
        version: '2.0',
        createdDate: new Date().toISOString(),
        lawFirm: {
          name: 'Ross AI Legal Services',
          id: 'FIRM001',
          address: {
            street1: '123 Legal Street',
            city: 'Legal City',
            state: 'CA',
            zipCode: '90210',
            country: 'US'
          }
        },
        client: {
          name: config.clientName,
          id: config.clientId,
          address: {
            street1: '456 Client Avenue',
            city: 'Client City',
            state: 'NY',
            zipCode: '10001',
            country: 'US'
          }
        }
      },
      invoice: {
        invoiceNumber: `INV-${Date.now()}`,
        invoiceDate: new Date().toISOString().split('T')[0],
        matterNumber: timeEntries[0]?.matterId || 'MATTER001',
        matterDescription: timeEntries[0]?.matterTitle || 'Legal Matter',
        billingPeriod: {
          startDate: request.filters.dateRange.startDate,
          endDate: request.filters.dateRange.endDate
        },
        billingAttorney: {
          name: 'John Doe',
          id: 'ATT001'
        }
      },
      lineItems: timeEntries.map((entry, index) => ({
        lineNumber: index + 1,
        date: entry.date,
        timekeeper: {
          id: entry.userId || 'TK001',
          name: 'John Doe',
          classification: 'Attorney'
        },
        activity: {
          code: this.mapToUTBMSActivity(entry.activityType || 'general_work', config.utbmsMapping),
          description: entry.description
        },
        task: {
          code: 'T001',
          description: 'General Legal Services'
        },
        units: entry.hours,
        rate: entry.rate,
        amount: entry.amount,
        narrative: entry.description
      })),
      summary: {
        totalFees: timeEntries.reduce((sum, entry) => sum + entry.amount, 0),
        totalExpenses: 0,
        totalAmount: timeEntries.reduce((sum, entry) => sum + entry.amount, 0),
        totalHours: timeEntries.reduce((sum, entry) => sum + entry.hours, 0),
        currency: 'USD'
      }
    };

    return this.convertToXML(xmlRecord);
  }

  // Validation
  private static async validateExportData(
    timeEntries: TimeEntry[],
    config: LEDESConfiguration
  ): Promise<LEDESValidationResult> {
    const errors: LEDESValidationError[] = [];
    const warnings: LEDESValidationWarning[] = [];

    timeEntries.forEach((entry, index) => {
      // Required field validation
      if (!entry.description || entry.description.trim() === '') {
        errors.push({
          id: Date.now().toString() + index,
          recordNumber: index + 1,
          field: 'description',
          value: entry.description,
          rule: 'required',
          message: 'Line item description is required',
          severity: 'error'
        });
      }

      if (!entry.matterId) {
        errors.push({
          id: Date.now().toString() + index + 'matter',
          recordNumber: index + 1,
          field: 'matterId',
          value: entry.matterId,
          rule: 'required',
          message: 'Matter ID is required',
          severity: 'critical'
        });
      }

      if (entry.hours <= 0) {
        errors.push({
          id: Date.now().toString() + index + 'hours',
          recordNumber: index + 1,
          field: 'hours',
          value: entry.hours,
          rule: 'range',
          message: 'Hours must be greater than zero',
          severity: 'error'
        });
      }

      if (entry.rate <= 0) {
        errors.push({
          id: Date.now().toString() + index + 'rate',
          recordNumber: index + 1,
          field: 'rate',
          value: entry.rate,
          rule: 'range',
          message: 'Rate must be greater than zero',
          severity: 'error'
        });
      }

      // Warnings
      if (entry.hours > 24) {
        warnings.push({
          id: Date.now().toString() + index + 'hours_warning',
          recordNumber: index + 1,
          field: 'hours',
          value: entry.hours,
          message: 'Entry exceeds 24 hours for a single day',
          suggestion: 'Verify the hours entered are correct'
        });
      }

      if (entry.description.length > 500) {
        warnings.push({
          id: Date.now().toString() + index + 'desc_warning',
          recordNumber: index + 1,
          field: 'description',
          value: entry.description,
          message: 'Description is very long',
          suggestion: 'Consider shortening the description for better readability'
        });
      }
    });

    return {
      isValid: errors.filter(e => e.severity === 'critical').length === 0,
      errors,
      warnings,
      recordCount: timeEntries.length,
      totalAmount: timeEntries.reduce((sum, entry) => sum + entry.amount, 0)
    };
  }

  // Utility Methods
  private static mapToUTBMSActivity(activityType: string, mapping: UTBMSMapping): UTBMSActivityCode {
    const mapped = mapping.activityCodes.get(activityType);
    if (mapped) return mapped;

    // Default mapping based on activity type
    const defaultMap: Record<string, UTBMSActivityCode> = {
      'legal_research': 'L300',
      'document_review': 'L400',
      'document_drafting': 'L500',
      'client_meeting': 'L110',
      'court_appearance': 'L500',
      'correspondence': 'L110',
      'phone_call': 'L110',
      'general_work': 'L110'
    };

    return defaultMap[activityType] || mapping.defaultActivityCode || 'L110';
  }

  private static getLEDES1998BHeaders(): string[] {
    return [
      'INVOICE_DATE', 'INVOICE_NUMBER', 'CLIENT_MATTER_NUMBER', 'LAW_FIRM_MATTER_ID',
      'INVOICE_TOTAL', 'BILLING_START_DATE', 'BILLING_END_DATE', 'INVOICE_DESCRIPTION',
      'LINE_ITEM_NUMBER', 'EXP_FEE_INV_ADJ_TYPE', 'LINE_ITEM_NUMBER_OF_UNITS',
      'LINE_ITEM_UNIT_COST', 'LINE_ITEM_TOTAL', 'LINE_ITEM_DATE', 'LINE_ITEM_TASK_CODE',
      'LINE_ITEM_EXPENSE_CODE', 'LINE_ITEM_ACTIVITY_CODE', 'TIMEKEEPER_ID',
      'LINE_ITEM_DESCRIPTION', 'LAW_FIRM_NAME', 'BILLING_ATTORNEY', 'BILLING_ATTORNEY_ID',
      'TIMEKEEPER_NAME', 'TIMEKEEPER_CLASSIFICATION'
    ];
  }

  private static getLEDES20Headers(): string[] {
    return [
      ...this.getLEDES1998BHeaders(),
      'CLIENT_ID', 'MATTER_DESCRIPTION', 'PRACTICE_AREA', 'OFFICE_LOCATION',
      'CURRENCY_CODE', 'DISCOUNT_AMOUNT', 'WRITEOFF_AMOUNT', 'WRITEUP_AMOUNT',
      'ADJUSTMENT_REASON', 'VENDOR_NAME', 'VENDOR_ID', 'CHECK_NUMBER', 'VOUCHER_NUMBER'
    ];
  }

  private static convertToCSV(records: any[], headers: string[]): string {
    const csvRows = [];
    csvRows.push(headers.join(','));

    records.forEach(record => {
      const values = headers.map(header => {
        let value = record[header];
        if (value === undefined || value === null) {
          value = '';
        }
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }

  private static convertToXML(record: LEDESXMLRecord): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<ledes>
  <header>
    <version>${record.header.version}</version>
    <created_date>${record.header.createdDate}</created_date>
    <law_firm>
      <name>${record.header.lawFirm.name}</name>
      <id>${record.header.lawFirm.id}</id>
      <address>
        <street1>${record.header.lawFirm.address.street1}</street1>
        <city>${record.header.lawFirm.address.city}</city>
        <state>${record.header.lawFirm.address.state}</state>
        <zip_code>${record.header.lawFirm.address.zipCode}</zip_code>
        <country>${record.header.lawFirm.address.country}</country>
      </address>
    </law_firm>
    <client>
      <name>${record.header.client.name}</name>
      <id>${record.header.client.id}</id>
    </client>
  </header>
  <invoice>
    <invoice_number>${record.invoice.invoiceNumber}</invoice_number>
    <invoice_date>${record.invoice.invoiceDate}</invoice_date>
    <matter_number>${record.invoice.matterNumber}</matter_number>
    <matter_description>${record.invoice.matterDescription}</matter_description>
    <billing_period>
      <start_date>${record.invoice.billingPeriod.startDate}</start_date>
      <end_date>${record.invoice.billingPeriod.endDate}</end_date>
    </billing_period>
  </invoice>
  <line_items>
    ${record.lineItems.map(item => `
    <line_item>
      <line_number>${item.lineNumber}</line_number>
      <date>${item.date}</date>
      <timekeeper>
        <id>${item.timekeeper.id}</id>
        <name>${item.timekeeper.name}</name>
        <classification>${item.timekeeper.classification}</classification>
      </timekeeper>
      <activity>
        <code>${item.activity.code}</code>
        <description>${item.activity.description}</description>
      </activity>
      <units>${item.units}</units>
      <rate>${item.rate}</rate>
      <amount>${item.amount}</amount>
      <narrative>${item.narrative}</narrative>
    </line_item>`).join('')}
  </line_items>
  <summary>
    <total_fees>${record.summary.totalFees}</total_fees>
    <total_expenses>${record.summary.totalExpenses}</total_expenses>
    <total_amount>${record.summary.totalAmount}</total_amount>
    <total_hours>${record.summary.totalHours}</total_hours>
    <currency>${record.summary.currency}</currency>
  </summary>
</ledes>`;
  }

  private static async getFilteredTimeEntries(filters: any): Promise<TimeEntry[]> {
    // Get all time entries and apply filters
    const allEntries = await BillingService.getTimeEntries();
    
    return allEntries.filter(entry => {
      // Date range filter
      if (filters.dateRange) {
        if (entry.date < filters.dateRange.startDate || entry.date > filters.dateRange.endDate) {
          return false;
        }
      }

      // Client filter
      if (filters.clientIds && filters.clientIds.length > 0) {
        if (!filters.clientIds.includes(entry.clientId)) {
          return false;
        }
      }

      // Matter filter
      if (filters.matterIds && filters.matterIds.length > 0) {
        if (!filters.matterIds.includes(entry.matterId)) {
          return false;
        }
      }

      // Billing status filter
      if (filters.billingStatus && filters.billingStatus !== 'all') {
        if (filters.billingStatus === 'billed' && entry.status !== 'billed') {
          return false;
        }
        if (filters.billingStatus === 'unbilled' && entry.status === 'billed') {
          return false;
        }
      }

      return entry.billable;
    });
  }

  private static createDownloadUrl(data: string, fileName: string): string {
    const blob = new Blob([data], { type: 'text/plain' });
    return URL.createObjectURL(blob);
  }

  private static async saveExportHistory(result: LEDESExportResult): Promise<void> {
    const history = JSON.parse(localStorage.getItem(this.EXPORT_HISTORY_KEY) || '[]');
    history.unshift(result);
    // Keep only last 50 exports
    if (history.length > 50) {
      history.splice(50);
    }
    localStorage.setItem(this.EXPORT_HISTORY_KEY, JSON.stringify(history));
  }

  static async getExportHistory(): Promise<LEDESExportResult[]> {
    return JSON.parse(localStorage.getItem(this.EXPORT_HISTORY_KEY) || '[]');
  }

  // Mock data generation
  private static generateMockConfigurations(): LEDESConfiguration[] {
    return [
      {
        id: 'config-1',
        clientId: 'client-1',
        clientName: 'Acme Corporation',
        format: 'LEDES1998B',
        version: '1.0',
        utbmsMapping: new Map([
          ['legal_research', 'L300'],
          ['document_review', 'L400'],
          ['document_drafting', 'L500'],
          ['client_meeting', 'L110'],
          ['general_work', 'L110']
        ]) as any,
        validationRules: [
          {
            id: 'rule-1',
            field: 'description',
            ruleType: 'required',
            value: true,
            errorMessage: 'Description is required',
            isActive: true
          }
        ],
        customFields: [],
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 'config-2',
        clientId: 'client-2',
        clientName: 'Global Tech Industries',
        format: 'LEDES2.0',
        version: '2.0',
        utbmsMapping: new Map([
          ['legal_research', 'L300'],
          ['document_review', 'L400'],
          ['document_drafting', 'L500'],
          ['court_appearance', 'L500'],
          ['general_work', 'L110']
        ]) as any,
        validationRules: [],
        customFields: [],
        isActive: true,
        createdAt: '2024-02-01T14:30:00Z',
        updatedAt: '2024-02-01T14:30:00Z'
      }
    ];
  }

  // UTBMS Code utilities
  static getUTBMSActivities(): UTBMSActivityDefinition[] {
    return [...this.UTBMS_ACTIVITIES];
  }

  static getUTBMSExpenses(): UTBMSExpenseDefinition[] {
    return [...this.UTBMS_EXPENSES];
  }

  static getUTBMSActivityByCode(code: UTBMSActivityCode): UTBMSActivityDefinition | undefined {
    return this.UTBMS_ACTIVITIES.find(activity => activity.code === code);
  }

  static getUTBMSExpenseByCode(code: UTBMSExpenseCode): UTBMSExpenseDefinition | undefined {
    return this.UTBMS_EXPENSES.find(expense => expense.code === code);
  }
}