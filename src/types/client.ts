
export type ClientStatus = 'active' | 'inactive' | 'prospect';
export type ClientType = 'person' | 'company';
export type ContactType = 'work' | 'personal' | 'home' | 'mobile' | 'fax' | 'other';
export type AddressType = 'work' | 'home' | 'billing' | 'shipping' | 'other';
export type WebsiteType = 'work' | 'personal' | 'portfolio' | 'social' | 'other';

// Lead Management Types
export type LeadStatus = 'prospect' | 'qualified' | 'consultation' | 'proposal' | 'converted' | 'lost';
export type IntakeStage = 'initial' | 'qualification' | 'conflict_check' | 'consultation' | 'proposal' | 'onboarding' | 'completed';
export type LeadSourceCategory = 'referral' | 'marketing' | 'organic' | 'advertising' | 'networking' | 'social_media' | 'other';
export type ActivityType = 'contact' | 'email' | 'call' | 'meeting' | 'document' | 'note' | 'task' | 'follow_up';
export type ActivityStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type ActivityPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ContactMethod {
  id: string;
  value: string;
  type: ContactType;
  isPrimary: boolean;
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  type: AddressType;
  isPrimary: boolean;
}

export interface Website {
  id: string;
  url: string;
  type: WebsiteType;
  isPrimary: boolean;
}

export interface PersonDetails {
  prefix?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  title?: string;
  dateOfBirth?: string;
  company?: string;
}

export interface Client {
  id: string;
  name: string;
  type: ClientType;
  status: ClientStatus;
  
  // Person-specific fields
  personDetails?: PersonDetails;
  
  // Contact information
  emails: ContactMethod[];
  phones: ContactMethod[];
  websites: Website[];
  addresses: Address[];
  
  // Profile
  profilePhoto?: string;
  
  // Business information
  primaryContact: string;
  dateAdded: string;
  lastActivity: string;
  totalMatters: number;
  activeMatters: number;
  totalBilled: number;
  outstandingBalance: number;
  industry?: string;
  tags: string[];
  notes?: string;
  
  // Lead Management Properties
  leadStatus?: LeadStatus;
  leadScore?: number;
  leadSource?: string;
  intakeStage?: IntakeStage;
  qualifiedDate?: string;
  consultationDate?: string;
  conversionDate?: string;
  assignedAttorneyId?: string;
  referralSource?: string;
}

export interface ClientFilters {
  status?: ClientStatus[];
  type?: ClientType[];
  industry?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  outstandingBalance?: {
    min: number;
    max: number;
  };
  tags?: string[];
}

export interface NewClientData {
  name: string;
  type: ClientType;
  status: ClientStatus;
  
  // Person-specific fields
  personDetails?: PersonDetails;
  
  // Contact information
  emails: ContactMethod[];
  phones: ContactMethod[];
  websites: Website[];
  addresses: Address[];
  
  // Profile
  profilePhoto?: string;
  
  // Business information
  primaryContact: string;
  industry: string;
  tags: string[];
  notes: string;
  
  // Lead Management Properties
  leadStatus?: LeadStatus;
  leadScore?: number;
  leadSource?: string;
  intakeStage?: IntakeStage;
  referralSource?: string;
}
