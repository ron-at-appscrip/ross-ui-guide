export type PatentStatus = 'pending' | 'granted' | 'abandoned' | 'expired' | 'published';
export type TrademarkStatus = 'pending' | 'registered' | 'abandoned' | 'cancelled' | 'opposition';
export type SearchType = 'patents' | 'trademarks';

export interface DateRange {
  start?: string;
  end?: string;
}

export interface PatentSearchQuery {
  keywords?: string;
  inventor?: string;
  assignee?: string;
  patentNumber?: string;
  applicationNumber?: string;
  dateRange?: DateRange;
  classification?: string[];
  status?: PatentStatus[];
  sortBy?: 'relevance' | 'date' | 'patent_number';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface TrademarkSearchQuery {
  mark?: string;
  owner?: string;
  serialNumber?: string;
  registrationNumber?: string;
  class?: string[];
  status?: TrademarkStatus[];
  dateRange?: DateRange;
  sortBy?: 'relevance' | 'date' | 'serial_number';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface PatentResult {
  id: string;
  patentNumber: string;
  applicationNumber: string;
  title: string;
  inventors: string[];
  assignee: string;
  filingDate: string;
  publicationDate?: string;
  grantDate?: string;
  status: PatentStatus;
  abstract: string;
  claims: number;
  classification: string[];
  citedBy: number;
  cites: number;
  familySize: number;
  priorityDate?: string;
  expirationDate?: string;
  maintenanceFees?: {
    due4Year?: string;
    due8Year?: string;
    due12Year?: string;
  };
  attachments?: Document[];
  clientId?: string;
  matterId?: string;
  linkedAt?: string;
  linkedBy?: string;
}

export interface RenewalReminder {
  id: string;
  type: 'renewal' | 'section8' | 'section71' | 'grace_period';
  dueDate: string;
  reminderDates: string[]; // e.g., [365 days before, 180 days, 90 days, 30 days, 7 days]
  isActive: boolean;
  notificationsSent: NotificationLog[];
}

export interface NotificationLog {
  id: string;
  sentAt: string;
  type: 'email' | 'dashboard' | 'sms';
  status: 'sent' | 'failed' | 'read';
}

export interface DeadlineInfo {
  date: string;
  daysRemaining: number;
  status: 'current' | 'due_soon' | 'overdue' | 'expired';
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface TrademarkDeadlines {
  gracePeriod?: DeadlineInfo;
  renewal?: DeadlineInfo;
  section8?: DeadlineInfo;
  section71?: DeadlineInfo;
  nextMajorDeadline?: DeadlineInfo;
}

export interface ProsecutionHistoryEvent {
  id: string;
  date: string;
  eventType: string;
  description: string;
  status: 'completed' | 'pending' | 'rejected';
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface OwnerInformation {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  entityType?: string; // Individual, Corporation, LLC, etc.
  stateOrCountryOrganized?: string;
  legalEntityType?: string;
  ownerAddress?: {
    street1?: string;
    street2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  registrationDate?: string;
  citizenshipCountry?: string;
  entityDetail?: string;
}

export interface AttorneyInformation {
  name?: string;
  firm?: string;
  address?: string;
  address2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  mainEmail?: string;
  alternateEmail?: string;
  docketNumber?: string;
  role?: string;
  fax?: string;
  barNumber?: string;
}

export interface TrademarkResult {
  id: string;
  serialNumber: string;
  registrationNumber?: string;
  mark: string;
  owner: string;
  ownerAddress?: string;
  filingDate: string;
  registrationDate?: string;
  status: TrademarkStatus;
  class: string[];
  description: string;
  disclaimer?: string;
  designSearch?: string[];
  statusDate: string;
  renewalDate?: string;
  attorney?: string;
  correspondenceAddress?: string;
  attachments?: Document[];
  clientId?: string;
  matterId?: string;
  linkedAt?: string;
  linkedBy?: string;
  
  // Enhanced renewal and deadline information
  goodsAndServices?: string;
  primaryClass?: string;
  deadlines?: TrademarkDeadlines;
  renewalStatus?: 'current' | 'due_soon' | 'overdue' | 'expired';
  renewalReminders?: RenewalReminder[];
  
  // Enhanced metadata
  dataSource?: 'xml' | 'html' | 'mock';
  lastUpdated?: string;
  xmlParseSuccess?: boolean;
  isForeignBased?: boolean;
  
  // Raw API response data for full details view
  rawXmlData?: string;
  rawHtmlData?: string;
  
  // Prosecution history events parsed from XML/HTML
  prosecutionHistory?: ProsecutionHistoryEvent[];
  
  // Enhanced owner and attorney information
  ownerInformation?: OwnerInformation;
  attorneyInformation?: AttorneyInformation;
}

export interface SavedSearch {
  id: string;
  name: string;
  type: SearchType;
  query: PatentSearchQuery | TrademarkSearchQuery;
  description?: string;
  createdAt: string;
  updatedAt: string;
  lastRunAt?: string;
  resultCount?: number;
  isAlert: boolean;
  alertFrequency?: 'daily' | 'weekly' | 'monthly';
  clientId?: string;
  matterId?: string;
}

export interface SearchResult<T> {
  results: T[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
  searchTime: number;
  query: PatentSearchQuery | TrademarkSearchQuery;
}

export interface PatentFamily {
  id: string;
  parentApplication?: string;
  childApplications: string[];
  continuations: string[];
  divisionals: string[];
  continuationsInPart: string[];
  provisionals: string[];
  internationalApplications: string[];
}

export interface CitationAnalysis {
  totalCitations: number;
  forwardCitations: number;
  backwardCitations: number;
  selfCitations: number;
  examinerCitations: number;
  applicantCitations: number;
  citingPatents: PatentResult[];
  citedPatents: PatentResult[];
}

export interface PortfolioItem {
  id: string;
  type: 'patent' | 'trademark' | 'application';
  assetId: string;
  clientId: string;
  matterId?: string;
  status: PatentStatus | TrademarkStatus;
  value?: number;
  renewalDate?: string;
  maintenanceDate?: string;
  deadlines: Deadline[];
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Deadline {
  id: string;
  type: 'maintenance_fee' | 'renewal' | 'response_due' | 'examination' | 'publication';
  date: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reminderDays?: number[];
  cost?: number;
  notes?: string;
}

export interface USPTOAnalytics {
  totalSearches: number;
  recentSearches: SavedSearch[];
  popularClassifications: { code: string; name: string; count: number }[];
  searchTrends: { date: string; patents: number; trademarks: number }[];
  portfolioSummary: {
    totalAssets: number;
    patents: number;
    trademarks: number;
    applications: number;
    value: number;
  };
  upcomingDeadlines: Deadline[];
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  uploadDate: string;
}

export interface ClassificationCode {
  code: string;
  title: string;
  definition?: string;
  examples?: string[];
}

export interface LegalEvent {
  date: string;
  event: string;
  description: string;
}

export interface USPTOSearchFilters {
  patentFilters: {
    status: PatentStatus[];
    dateRange: DateRange;
    classification: string[];
    assigneeType: ('company' | 'individual' | 'government' | 'university')[];
    hasMaintenanceFees: boolean;
    citationRange: { min?: number; max?: number };
  };
  trademarkFilters: {
    status: TrademarkStatus[];
    dateRange: DateRange;
    class: string[];
    markType: ('word' | 'design' | 'combined' | 'sound' | 'motion' | 'hologram')[];
    liveStatus: boolean;
  };
}

export interface USPTOError {
  code: string;
  message: string;
  details?: string;
  retryable: boolean;
}

export interface USPTOConfig {
  apiKey?: string;
  baseUrl: string;
  timeout: number;
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  features: {
    realTimeData: boolean;
    bulkOperations: boolean;
    advancedAnalytics: boolean;
    alertSystem: boolean;
  };
}

export interface USPTOAssetLink {
  id: string;
  assetType: 'patent' | 'trademark';
  assetId: string;
  patentNumber?: string;
  serialNumber?: string;
  registrationNumber?: string;
  title: string;
  clientId: string;
  clientName: string;
  matterId?: string;
  matterTitle?: string;
  linkedAt: string;
  linkedBy: string;
  billable: boolean;
  timeSpent?: number;
  hourlyRate?: number;
  totalCost?: number;
  searchQuery?: string;
  activityType: 'search' | 'view' | 'download' | 'analysis';
  status: 'active' | 'archived';
  notes?: string;
}

export interface USPTOActivity {
  id: string;
  type: 'search' | 'view' | 'download' | 'link' | 'unlink' | 'analysis';
  assetType: 'patent' | 'trademark';
  assetId?: string;
  patentNumber?: string;
  serialNumber?: string;
  registrationNumber?: string;
  clientId?: string;
  matterId?: string;
  userId: string;
  timestamp: string;
  searchQuery?: string;
  resultCount?: number;
  timeSpent?: number;
  billable: boolean;
  cost?: number;
  metadata?: Record<string, any>;
}

export interface TSDRDocumentInfo {
  serialNumber: string;
  registrationNumber?: string;
  mark: string;
  owner: string;
  status: TrademarkStatus;
  filingDate: string;
  registrationDate?: string;
  statusDate: string;
  renewalDate?: string;
  class: string[];
  description: string;
  documents: TSDRDocument[];
}

export interface TSDRDocument {
  id: string;
  type: 'application' | 'registration' | 'correspondence' | 'specimen' | 'drawing';
  format: 'pdf' | 'zip' | 'html';
  name: string;
  description: string;
  date: string;
  size?: number;
  downloadUrl?: string;
  viewUrl?: string;
}

export interface ClientMatterOption {
  id: string;
  name: string;
  type: 'client' | 'matter';
  clientId?: string;
  parentId?: string;
  active: boolean;
}