// LEDES Billing Format Types and Interfaces

export type LEDESFormat = 'LEDES1998B' | 'LEDES2.0' | 'LEDESXML';
export type UTBMSActivityCode = 'L100' | 'L110' | 'L120' | 'L130' | 'L140' | 'L150' | 'L160' | 'L170' | 'L200' | 'L210' | 'L220' | 'L230' | 'L240' | 'L250' | 'L300' | 'L310' | 'L320' | 'L400' | 'L410' | 'L420' | 'L500' | 'L510' | 'L520' | 'L530';
export type UTBMSExpenseCode = 'E100' | 'E110' | 'E120' | 'E130' | 'E140' | 'E150' | 'E160' | 'E170' | 'E200' | 'E210' | 'E220' | 'E300';

export interface LEDESConfiguration {
  id: string;
  clientId: string;
  clientName: string;
  format: LEDESFormat;
  version: string;
  utbmsMapping: UTBMSMapping;
  validationRules: LEDESValidationRule[];
  customFields: LEDESCustomField[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UTBMSMapping {
  activityCodes: Map<string, UTBMSActivityCode>;
  expenseCodes: Map<string, UTBMSExpenseCode>;
  taskCodes: Map<string, string>;
  matterCategories: Map<string, string>;
  defaultActivityCode: UTBMSActivityCode;
  defaultExpenseCode: UTBMSExpenseCode;
}

export interface LEDESValidationRule {
  id: string;
  field: string;
  ruleType: 'required' | 'format' | 'range' | 'custom';
  value: any;
  errorMessage: string;
  isActive: boolean;
}

export interface LEDESCustomField {
  id: string;
  fieldName: string;
  fieldType: 'text' | 'number' | 'date' | 'currency';
  isRequired: boolean;
  defaultValue?: string;
  validationPattern?: string;
}

// LEDES 1998B Format
export interface LEDES1998BRecord {
  INVOICE_DATE: string;           // Format: YYYY/MM/DD
  INVOICE_NUMBER: string;         // Client invoice number
  CLIENT_MATTER_NUMBER: string;   // Client matter identifier
  LAW_FIRM_MATTER_ID: string;    // Law firm internal matter ID
  INVOICE_TOTAL: number;          // Total invoice amount
  BILLING_START_DATE: string;     // Format: YYYY/MM/DD
  BILLING_END_DATE: string;       // Format: YYYY/MM/DD
  INVOICE_DESCRIPTION: string;    // Invoice description
  LINE_ITEM_NUMBER: number;       // Sequential line number
  EXP_FEE_INV_ADJ_TYPE: 'F' | 'E' | 'I' | 'A';  // Fee, Expense, Invoice, Adjustment
  LINE_ITEM_NUMBER_OF_UNITS: number;  // Hours or quantity
  LINE_ITEM_UNIT_COST: number;    // Rate or unit cost
  LINE_ITEM_TOTAL: number;        // Line item total
  LINE_ITEM_DATE: string;         // Format: YYYY/MM/DD
  LINE_ITEM_TASK_CODE: string;    // UTBMS task code
  LINE_ITEM_EXPENSE_CODE?: string; // UTBMS expense code (if applicable)
  LINE_ITEM_ACTIVITY_CODE: string; // UTBMS activity code
  TIMEKEEPER_ID?: string;         // Timekeeper identifier
  LINE_ITEM_DESCRIPTION: string;   // Line item description
  LAW_FIRM_NAME: string;          // Law firm name
  BILLING_ATTORNEY: string;       // Billing attorney name
  BILLING_ATTORNEY_ID: string;    // Billing attorney ID
  TIMEKEEPER_NAME?: string;       // Timekeeper name
  TIMEKEEPER_CLASSIFICATION?: string; // Attorney, Paralegal, etc.
}

// LEDES 2.0 Format (Extended)
export interface LEDES20Record extends LEDES1998BRecord {
  CLIENT_ID: string;              // Client identifier
  MATTER_DESCRIPTION: string;     // Matter description
  PRACTICE_AREA: string;          // Practice area code
  OFFICE_LOCATION: string;        // Office location code
  CURRENCY_CODE: string;          // ISO currency code (USD, EUR, etc.)
  DISCOUNT_AMOUNT?: number;       // Discount applied
  WRITEOFF_AMOUNT?: number;       // Write-off amount
  WRITEUP_AMOUNT?: number;        // Write-up amount
  ADJUSTMENT_REASON?: string;     // Reason for adjustment
  VENDOR_NAME?: string;           // Vendor name for expenses
  VENDOR_ID?: string;             // Vendor identifier
  CHECK_NUMBER?: string;          // Check number for expenses
  VOUCHER_NUMBER?: string;        // Voucher number
}

// XML Format Structure
export interface LEDESXMLRecord {
  header: LEDESXMLHeader;
  invoice: LEDESXMLInvoice;
  lineItems: LEDESXMLLineItem[];
  summary: LEDESXMLSummary;
}

export interface LEDESXMLHeader {
  version: string;
  createdDate: string;
  lawFirm: {
    name: string;
    id: string;
    address: LEDESAddress;
  };
  client: {
    name: string;
    id: string;
    address: LEDESAddress;
  };
}

export interface LEDESXMLInvoice {
  invoiceNumber: string;
  invoiceDate: string;
  matterNumber: string;
  matterDescription: string;
  billingPeriod: {
    startDate: string;
    endDate: string;
  };
  billingAttorney: {
    name: string;
    id: string;
  };
}

export interface LEDESXMLLineItem {
  lineNumber: number;
  date: string;
  timekeeper: {
    id: string;
    name: string;
    classification: string;
  };
  activity: {
    code: UTBMSActivityCode;
    description: string;
  };
  task: {
    code: string;
    description: string;
  };
  expense?: {
    code: UTBMSExpenseCode;
    description: string;
    vendor?: string;
  };
  units: number;
  rate: number;
  amount: number;
  narrative: string;
}

export interface LEDESXMLSummary {
  totalFees: number;
  totalExpenses: number;
  totalAmount: number;
  totalHours: number;
  currency: string;
  adjustments?: LEDESAdjustment[];
}

export interface LEDESAddress {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface LEDESAdjustment {
  type: 'discount' | 'writeoff' | 'writeup';
  amount: number;
  reason: string;
}

export interface LEDESExportRequest {
  configurationId: string;
  format: LEDESFormat;
  filters: LEDESExportFilters;
  includeExpenses: boolean;
  includeAdjustments: boolean;
  groupByMatter: boolean;
  outputOptions: LEDESOutputOptions;
}

export interface LEDESExportFilters {
  clientIds?: string[];
  matterIds?: string[];
  timekeepers?: string[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
  billingStatus?: 'all' | 'billed' | 'unbilled';
  minimumAmount?: number;
  practiceAreas?: string[];
}

export interface LEDESOutputOptions {
  fileName?: string;
  includeHeader: boolean;
  delimiter?: string; // For CSV output
  dateFormat: 'YYYY/MM/DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY';
  currencyFormat: 'USD' | 'EUR' | 'GBP';
  decimalPlaces: number;
  includeTimekeeperDetails: boolean;
  includeMatterDetails: boolean;
}

export interface LEDESValidationResult {
  isValid: boolean;
  errors: LEDESValidationError[];
  warnings: LEDESValidationWarning[];
  recordCount: number;
  totalAmount: number;
}

export interface LEDESValidationError {
  id: string;
  recordNumber: number;
  field: string;
  value: any;
  rule: string;
  message: string;
  severity: 'error' | 'critical';
}

export interface LEDESValidationWarning {
  id: string;
  recordNumber: number;
  field: string;
  value: any;
  message: string;
  suggestion: string;
}

export interface LEDESExportResult {
  success: boolean;
  fileName: string;
  recordCount: number;
  totalAmount: number;
  format: LEDESFormat;
  exportDate: string;
  validationResult: LEDESValidationResult;
  downloadUrl?: string;
  errors?: string[];
}

// UTBMS Code Definitions
export interface UTBMSActivityDefinition {
  code: UTBMSActivityCode;
  description: string;
  category: 'case_assessment' | 'case_management' | 'fact_investigation' | 'fact_development' | 'legal_research' | 'document_drafting' | 'document_review' | 'client_relations' | 'expert_witness' | 'travel' | 'other';
  examples: string[];
  timeGuidelines?: string;
}

export interface UTBMSExpenseDefinition {
  code: UTBMSExpenseCode;
  description: string;
  category: 'court_fees' | 'service_fees' | 'investigation' | 'experts' | 'technology' | 'travel' | 'communications' | 'document_production' | 'other';
  examples: string[];
  requiresReceipt: boolean;
}

// Mock data structures for development
export interface MockLEDESData {
  configurations: LEDESConfiguration[];
  validationResults: LEDESValidationResult[];
  exportHistory: LEDESExportResult[];
  utbmsActivities: UTBMSActivityDefinition[];
  utbmsExpenses: UTBMSExpenseDefinition[];
}

// Client billing guidelines
export interface ClientBillingGuideline {
  id: string;
  clientId: string;
  clientName: string;
  effectiveDate: string;
  expirationDate?: string;
  requiredFormat: LEDESFormat;
  submissionMethod: 'email' | 'portal' | 'ftp' | 'api';
  billingCycle: 'monthly' | 'quarterly' | 'project_completion' | 'custom';
  approvalRequired: boolean;
  maximumLineItems?: number;
  requiredFields: string[];
  prohibitedExpenses?: string[];
  discountRules?: DiscountRule[];
  latePenalties?: LatePenaltyRule[];
  specialInstructions?: string;
}

export interface DiscountRule {
  condition: string;
  discountPercent: number;
  maxDiscountAmount?: number;
  appliesToFees: boolean;
  appliesToExpenses: boolean;
}

export interface LatePenaltyRule {
  daysLate: number;
  penaltyType: 'percentage' | 'fixed_amount';
  penaltyValue: number;
  compoundDaily: boolean;
}

export interface LEDESComplianceReport {
  clientId: string;
  reportDate: string;
  billingPeriod: {
    startDate: string;
    endDate: string;
  };
  complianceStatus: 'compliant' | 'non_compliant' | 'warning';
  violations: ComplianceViolation[];
  recommendations: string[];
  totalInvoiced: number;
  totalCompliant: number;
  complianceRate: number;
}

export interface ComplianceViolation {
  violationType: 'format_error' | 'missing_required_field' | 'invalid_code' | 'guideline_violation';
  description: string;
  invoiceNumber: string;
  lineItemNumber?: number;
  severity: 'high' | 'medium' | 'low';
  suggestedFix: string;
  impactAmount?: number;
}