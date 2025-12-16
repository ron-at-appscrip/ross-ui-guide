export type IntegrationCategory = 
  | 'practice_management'
  | 'document_storage'
  | 'email_communication'
  | 'billing_accounting'
  | 'legal_research'
  | 'ediscovery_litigation'
  | 'client_intake_crm'
  | 'compliance_security';

export type AuthType = 'oauth' | 'api_key' | 'basic';
export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending';
export type SetupComplexity = 'easy' | 'medium' | 'advanced';
export type PricingType = 'free' | 'paid' | 'freemium';

export interface Integration {
  id: string;
  name: string;
  category: IntegrationCategory;
  provider: string;
  description: string;
  longDescription: string;
  logoUrl: string;
  authType: AuthType;
  status: IntegrationStatus;
  features: string[];
  setupComplexity: SetupComplexity;
  pricing: PricingType;
  popularityRank: number;
  isPopular: boolean;
  compliance: string[];
  website: string;
  documentation: string;
  supportEmail: string;
  requiredFields: IntegrationField[];
  lastSync?: string;
  syncedRecords?: number;
  errorMessage?: string;
  connectedAt?: string;
  config?: Record<string, any>;
}

export interface IntegrationField {
  id: string;
  name: string;
  type: 'text' | 'password' | 'email' | 'url' | 'select';
  required: boolean;
  placeholder?: string;
  options?: string[];
  help?: string;
}

export interface IntegrationCategory {
  id: IntegrationCategory;
  name: string;
  description: string;
  icon: string;
  count: number;
}

export interface IntegrationConnectionRequest {
  integrationId: string;
  credentials: Record<string, any>;
  config?: Record<string, any>;
}

export interface IntegrationUsageStats {
  totalConnected: number;
  totalAvailable: number;
  mostPopular: Integration[];
  recentlyConnected: Integration[];
  byCategory: Record<IntegrationCategory, number>;
}

export interface IntegrationSearchFilters {
  category?: IntegrationCategory;
  authType?: AuthType;
  pricing?: PricingType;
  setupComplexity?: SetupComplexity;
  status?: IntegrationStatus;
  compliance?: string[];
  search?: string;
}

// Mock data constants
export const INTEGRATION_CATEGORIES: Record<IntegrationCategory, IntegrationCategory> = {
  practice_management: {
    id: 'practice_management',
    name: 'Practice Management',
    description: 'Comprehensive legal practice management platforms',
    icon: 'briefcase',
    count: 8
  },
  document_storage: {
    id: 'document_storage',
    name: 'Document & Storage',
    description: 'Secure document management and cloud storage',
    icon: 'folder',
    count: 6
  },
  email_communication: {
    id: 'email_communication',
    name: 'Email & Communication',
    description: 'Email, messaging, and collaboration tools',
    icon: 'mail',
    count: 6
  },
  billing_accounting: {
    id: 'billing_accounting',
    name: 'Billing & Accounting',
    description: 'Time tracking, billing, and accounting software',
    icon: 'dollar-sign',
    count: 6
  },
  legal_research: {
    id: 'legal_research',
    name: 'Legal Research',
    description: 'Legal research databases and court records',
    icon: 'search',
    count: 5
  },
  ediscovery_litigation: {
    id: 'ediscovery_litigation',
    name: 'E-Discovery & Litigation',
    description: 'E-discovery, litigation support, and case management',
    icon: 'scale',
    count: 5
  },
  client_intake_crm: {
    id: 'client_intake_crm',
    name: 'Client Intake & CRM',
    description: 'Client relationship management and intake systems',
    icon: 'users',
    count: 5
  },
  compliance_security: {
    id: 'compliance_security',
    name: 'Compliance & Security',
    description: 'Data protection, compliance, and security tools',
    icon: 'shield',
    count: 5
  }
};

export const COMPLIANCE_STANDARDS = [
  'SOC 2',
  'HIPAA',
  'ISO 27001',
  'ABA Model Rules',
  'GDPR',
  'CCPA',
  'FedRAMP',
  'PCI DSS'
];