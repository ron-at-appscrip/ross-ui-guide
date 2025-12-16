export interface XeroConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
  tenantId?: string;
}

export interface XeroTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export interface XeroTenant {
  tenantId: string;
  tenantType: string;
  tenantName: string;
  createdDateUtc: string;
  updatedDateUtc: string;
}

export interface XeroContact {
  ContactID?: string;
  ContactNumber?: string;
  AccountNumber?: string;
  ContactStatus?: 'ACTIVE' | 'ARCHIVED';
  Name: string;
  FirstName?: string;
  LastName?: string;
  EmailAddress?: string;
  BankAccountDetails?: string;
  Addresses?: XeroAddress[];
  Phones?: XeroPhone[];
  UpdatedDateUTC?: string;
  IsSupplier?: boolean;
  IsCustomer?: boolean;
}

export interface XeroAddress {
  AddressType: 'POBOX' | 'STREET';
  AddressLine1?: string;
  AddressLine2?: string;
  AddressLine3?: string;
  AddressLine4?: string;
  City?: string;
  Region?: string;
  PostalCode?: string;
  Country?: string;
  AttentionTo?: string;
}

export interface XeroPhone {
  PhoneType: 'DEFAULT' | 'DDI' | 'MOBILE' | 'FAX';
  PhoneNumber: string;
  PhoneAreaCode?: string;
  PhoneCountryCode?: string;
}

export interface XeroInvoice {
  InvoiceID?: string;
  InvoiceNumber?: string;
  Reference?: string;
  Type: 'ACCPAY' | 'ACCPAYCREDIT' | 'APOVERPAYMENT' | 'APPREPAYMENT' | 'ACCREC' | 'ACCRECREDIT' | 'AROVERPAYMENT' | 'ARPREPAYMENT';
  Contact: Pick<XeroContact, 'ContactID' | 'Name'>;
  Date: string; // YYYY-MM-DD format
  DueDate?: string; // YYYY-MM-DD format
  Status?: 'DRAFT' | 'SUBMITTED' | 'DELETED' | 'AUTHORISED' | 'PAID' | 'VOIDED';
  LineAmountTypes?: 'Exclusive' | 'Inclusive' | 'NoTax';
  LineItems: XeroLineItem[];
  SubTotal?: number;
  TotalTax?: number;
  Total?: number;
  UpdatedDateUTC?: string;
  CurrencyCode?: string;
  FullyPaidOnDate?: string;
  AmountDue?: number;
  AmountPaid?: number;
  AmountCredited?: number;
  SentToContact?: boolean;
  ExpectedPaymentDate?: string;
  PlannedPaymentDate?: string;
  CISDeduction?: number;
  HasErrors?: boolean;
  ValidationErrors?: XeroValidationError[];
}

export interface XeroLineItem {
  LineItemID?: string;
  Description: string;
  Quantity?: number;
  UnitAmount: number;
  ItemCode?: string;
  AccountCode?: string;
  TaxType?: string;
  TaxAmount?: number;
  LineAmount?: number;
  DiscountRate?: number;
  DiscountAmount?: number;
  RepeatingInvoiceID?: string;
  Tracking?: XeroTrackingCategory[];
}

export interface XeroTrackingCategory {
  TrackingCategoryID?: string;
  TrackingOptionID?: string;
  Name?: string;
  Option?: string;
}

export interface XeroPayment {
  PaymentID?: string;
  Invoice?: Pick<XeroInvoice, 'InvoiceID' | 'InvoiceNumber'>;
  Account?: XeroAccount;
  Date: string; // YYYY-MM-DD format
  Amount: number;
  Reference?: string;
  IsReconciled?: boolean;
  Status?: 'AUTHORISED' | 'DELETED';
  PaymentType?: 'ACCRECPAYMENT' | 'ACCPAYPAYMENT' | 'ARCREDITPAYMENT' | 'APCREDITPAYMENT' | 'AROVERPAYMENTPAYMENT' | 'ARPREPAYMENTPAYMENT' | 'APOVERPAYMENTPAYMENT' | 'APPREPAYMENTPAYMENT';
  UpdatedDateUTC?: string;
  HasErrors?: boolean;
  ValidationErrors?: XeroValidationError[];
}

export interface XeroAccount {
  AccountID?: string;
  Code?: string;
  Name?: string;
  Type?: 'BANK' | 'CURRENT' | 'CURRLIAB' | 'DEPRECIATN' | 'DIRECTCOSTS' | 'EQUITY' | 'EXPENSE' | 'FIXED' | 'INVENTORY' | 'LIABILITY' | 'NONCURRENT' | 'OTHERINCOME' | 'OVERHEADS' | 'PREPAYMENT' | 'REVENUE' | 'SALES' | 'TERMLIAB' | 'PAYGLIABILITY';
  BankAccountNumber?: string;
  Status?: 'ACTIVE' | 'ARCHIVED';
  BankAccountType?: 'BANK' | 'CREDITCARD' | 'PAYPAL';
  CurrencyCode?: string;
}

export interface XeroItem {
  ItemID?: string;
  Code: string;
  Name?: string;
  Description?: string;
  UnitPrice?: number;
  TaxType?: string;
  IsSold?: boolean;
  IsPurchased?: boolean;
  IsTrackedAsInventory?: boolean;
  QuantityOnHand?: number;
  TotalCostPool?: number;
  UpdatedDateUTC?: string;
}

export interface XeroValidationError {
  Message: string;
}

export interface XeroApiResponse<T> {
  Id?: string;
  Status?: string;
  ProviderName?: string;
  DateTimeUTC?: string;
  data?: T;
  errors?: XeroValidationError[];
}

export interface XeroInvoicesResponse extends XeroApiResponse<any> {
  Invoices?: XeroInvoice[];
}

export interface XeroPaymentsResponse extends XeroApiResponse<any> {
  Payments?: XeroPayment[];
}

export interface XeroContactsResponse extends XeroApiResponse<any> {
  Contacts?: XeroContact[];
}

export interface XeroAccountsResponse extends XeroApiResponse<any> {
  Accounts?: XeroAccount[];
}

export interface XeroItemsResponse extends XeroApiResponse<any> {
  Items?: XeroItem[];
}

export interface XeroTenantsResponse extends XeroApiResponse<any> {
  tenants?: XeroTenant[];
}

export interface XeroIntegrationSettings {
  isEnabled: boolean;
  autoSync: boolean;
  syncFrequency: 'hourly' | 'daily' | 'weekly';
  defaultAccountCode?: string;
  defaultTaxType?: string;
  defaultCurrency: string;
  invoicePrefix?: string;
  contactSyncEnabled: boolean;
  paymentSyncEnabled: boolean;
  lastSyncDate?: string;
}

export type XeroSyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface XeroSyncResult {
  status: XeroSyncStatus;
  message: string;
  timestamp: string;
  itemsProcessed: number;
  errors?: string[];
}