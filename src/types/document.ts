
export type DocumentType = 'pdf' | 'docx' | 'txt' | 'image' | 'other';
export type DocumentStatus = 'active' | 'archived' | 'draft';

// Comprehensive legal document categories based on practice areas
export type DocumentCategory = 
  // Corporate & Business
  | 'corporate_formation' | 'contracts_agreements' | 'employment_docs'
  // Litigation
  | 'pleadings' | 'motions' | 'discovery'
  // Real Estate
  | 'real_estate_purchase' | 'real_estate_lease' | 'real_estate_finance'
  // Estate Planning
  | 'wills_trusts' | 'powers_of_attorney' | 'healthcare_directives'
  // Family Law
  | 'divorce_separation' | 'custody_support' | 'prenuptial_postnuptial'
  // Intellectual Property
  | 'patents' | 'trademarks' | 'copyrights'
  // Additional Categories
  | 'criminal_law' | 'immigration' | 'bankruptcy' | 'regulatory_compliance'
  | 'legal_correspondence' | 'alternative_dispute_resolution'
  // Legacy categories
  | 'contract' | 'brief' | 'correspondence' | 'research' | 'evidence' | 'other';

// Document subtypes for more granular categorization
export type DocumentSubtype = 
  // Corporate Formation
  | 'articles_of_incorporation' | 'bylaws' | 'operating_agreement' | 'partnership_agreement'
  // Contracts & Agreements
  | 'nda' | 'service_agreement' | 'purchase_agreement' | 'vendor_contract' | 'licensing_agreement'
  // Employment
  | 'employment_contract' | 'offer_letter' | 'non_compete' | 'employee_handbook'
  // Pleadings
  | 'complaint' | 'answer' | 'counterclaim' | 'cross_claim' | 'amended_pleading'
  // Motions
  | 'motion_to_dismiss' | 'motion_summary_judgment' | 'motion_to_compel' | 'motion_in_limine'
  // Discovery
  | 'interrogatories' | 'requests_for_production' | 'deposition_notice' | 'subpoena'
  // Estate Planning
  | 'last_will_testament' | 'living_trust' | 'revocable_trust' | 'irrevocable_trust'
  // And many more...
  | 'other';

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  size: number;
  category: DocumentCategory;
  subtype?: DocumentSubtype;
  status: DocumentStatus;
  uploadedAt: string;
  modifiedAt: string;
  uploadedBy: string;
  matterId?: string;
  clientId?: string;
  tags: string[];
  description?: string;
  url: string;
  thumbnail?: string;
  isStarred: boolean;
  sharedWith: string[];
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canShare: boolean;
  };
  metadata: {
    pageCount?: number;
    wordCount?: number;
    language?: string;
    extractedText?: string;
    jurisdiction?: string;
    practiceArea?: string;
  };
  // AI Analysis results
  aiAnalysis?: AIAnalysis;
  // Version control
  version: number;
  parentId?: string; // For document versions
}

export interface DocumentFilters {
  type?: DocumentType[];
  category?: DocumentCategory[];
  status?: DocumentStatus[];
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  sizeRange?: {
    min: number;
    max: number;
  };
  matterId?: string;
  clientId?: string;
  uploadedBy?: string[];
}

export interface DocumentUpload {
  file: File;
  category: DocumentCategory;
  subtype?: DocumentSubtype;
  tags: string[];
  description?: string;
  matterId?: string;
  clientId?: string;
}

// Document Template System
export interface DocumentTemplate {
  id: string;
  name: string;
  category: DocumentCategory;
  subtype: DocumentSubtype;
  jurisdiction?: string;
  practiceArea: string;
  description: string;
  content: string; // Template content with placeholders
  fields: TemplateField[];
  aiTags: string[];
  usageCount: number;
  rating: number;
  isPopular: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  isActive: boolean;
}

export interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'date' | 'number' | 'select' | 'textarea' | 'checkbox' | 'signature';
  placeholder: string;
  required: boolean;
  options?: string[]; // For select fields
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
  aiSuggested?: boolean;
  defaultValue?: string;
}

// AI Analysis System
export type AnalysisType = 
  | 'contract_analysis' | 'risk_assessment' | 'compliance_check' 
  | 'litigation_analysis' | 'due_diligence' | 'document_summary'
  | 'key_terms_extraction' | 'obligation_mapping' | 'date_extraction';

export interface AIAnalysis {
  id: string;
  documentId: string;
  analysisType: AnalysisType;
  riskScore: number; // 0-100
  confidence: number; // 0-1
  findings: Finding[];
  recommendations: Recommendation[];
  summary: string;
  keyDates: KeyDate[];
  obligations: Obligation[];
  keyTerms: KeyTerm[];
  complianceIssues: ComplianceIssue[];
  createdAt: string;
  processingTime: number; // in milliseconds
  modelVersion: string;
}

export interface Finding {
  id: string;
  type: 'risk' | 'opportunity' | 'missing_clause' | 'unfavorable_term' | 'compliance_issue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: {
    page?: number;
    paragraph?: number;
    startChar?: number;
    endChar?: number;
  };
  confidence: number;
  suggestedAction?: string;
}

export interface Recommendation {
  id: string;
  type: 'add_clause' | 'modify_clause' | 'remove_clause' | 'negotiate_term' | 'legal_review';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  reasoning: string;
  suggestedText?: string;
  relatedFindings: string[]; // Finding IDs
}

export interface KeyDate {
  id: string;
  date: string;
  type: 'deadline' | 'milestone' | 'renewal' | 'expiration' | 'filing_date';
  description: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  location: {
    page?: number;
    paragraph?: number;
  };
}

export interface Obligation {
  id: string;
  party: string;
  description: string;
  type: 'payment' | 'performance' | 'delivery' | 'compliance' | 'reporting';
  deadline?: string;
  conditions?: string[];
  consequences?: string;
  location: {
    page?: number;
    paragraph?: number;
  };
}

export interface KeyTerm {
  id: string;
  term: string;
  definition: string;
  importance: 'low' | 'medium' | 'high';
  context: string;
  location: {
    page?: number;
    paragraph?: number;
  };
}

export interface ComplianceIssue {
  id: string;
  regulation: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  remediation: string;
  deadline?: string;
}

// Document Workflow System
export interface DocumentWorkflow {
  id: string;
  name: string;
  description: string;
  documentId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  steps: WorkflowStep[];
  assignedTo: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'review' | 'approval' | 'signature' | 'filing' | 'ai_analysis' | 'custom';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  assignedTo?: string;
  completedBy?: string;
  completedAt?: string;
  dueDate?: string;
  dependencies?: string[]; // Step IDs
  aiSuggested?: boolean;
}
