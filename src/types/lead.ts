import { LeadStatus, IntakeStage, LeadSourceCategory, ActivityType, ActivityStatus, ActivityPriority } from './client';

// Lead Source Interface
export interface LeadSource {
  id: string;
  name: string;
  category: LeadSourceCategory;
  description?: string;
  trackingCode?: string;
  costPerLead?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Lead Activity Interface
export interface LeadActivity {
  id: string;
  leadId: string;
  activityType: ActivityType;
  title: string;
  description?: string;
  
  // Scheduling
  scheduledDate?: string;
  completedDate?: string;
  dueDate?: string;
  
  // Status and priority
  status: ActivityStatus;
  priority: ActivityPriority;
  
  // Assignment
  assignedTo?: string;
  createdBy: string;
  
  // Metadata
  metadata?: Record<string, any>;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Intake Workflow Stage Interface
export interface IntakeWorkflowStage {
  id: string;
  name: string;
  description: string;
  requiredFields: string[];
  autoAdvance: boolean;
  estimatedDuration?: number; // in minutes
  tasks?: string[];
}

// Intake Workflow Interface
export interface IntakeWorkflow {
  id: string;
  name: string;
  description?: string;
  practiceArea?: string;
  clientType?: 'person' | 'company' | 'both';
  stages: IntakeWorkflowStage[];
  automationRules?: Record<string, any>;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Conflict Check Interface
export interface ConflictCheck {
  id: string;
  clientId: string;
  checkType: 'automatic' | 'manual' | 'external';
  status: 'pending' | 'in_progress' | 'clear' | 'conflict_found' | 'requires_review';
  conflictDetails?: string;
  resolutionNotes?: string;
  checkedBy?: string;
  checkedDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Lead Analytics Interface
export interface LeadAnalytics {
  totalLeads: number;
  conversionRate: number;
  averageLeadScore: number;
  averageIntakeTime: number; // in days
  leadsBySource: { source: string; count: number; conversionRate: number }[];
  leadsByStage: { stage: IntakeStage; count: number }[];
  leadsByStatus: { status: LeadStatus; count: number }[];
  monthlyTrends: {
    month: string;
    leads: number;
    conversions: number;
    conversionRate: number;
  }[];
}

// Lead Scoring Factors Interface
export interface LeadScoringFactors {
  matterUrgency: number; // 0-100
  budgetRange: number; // 0-100
  referralQuality: number; // 0-100
  responseTime: number; // 0-100
  practiceAreaMatch: number; // 0-100
  geographicMatch: number; // 0-100
}

// Lead Assignment Rule Interface
export interface LeadAssignmentRule {
  id: string;
  name: string;
  conditions: {
    practiceArea?: string[];
    leadSource?: string[];
    clientType?: ('person' | 'company')[];
    leadScore?: { min: number; max: number };
    geography?: string[];
  };
  assignTo: string; // attorney ID
  priority: number;
  isActive: boolean;
}

// Lead Nurturing Campaign Interface
export interface LeadNurturingCampaign {
  id: string;
  name: string;
  description?: string;
  triggers: {
    leadStatus?: LeadStatus[];
    intakeStage?: IntakeStage[];
    leadScore?: { min: number; max: number };
    daysSinceLastActivity?: number;
  };
  actions: {
    type: 'email' | 'task' | 'call' | 'meeting';
    delay: number; // in days
    template: string;
    assignTo?: string;
  }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Lead Filters Interface
export interface LeadFilters {
  status?: LeadStatus[];
  stage?: IntakeStage[];
  source?: string[];
  assignedTo?: string[];
  scoreRange?: { min: number; max: number };
  dateRange?: { start: string; end: string };
  practiceArea?: string[];
  clientType?: ('person' | 'company')[];
}

// Lead Search Interface
export interface LeadSearch {
  query: string;
  filters: LeadFilters;
  sortBy: 'name' | 'created_at' | 'lead_score' | 'last_activity';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

// Lead Conversion Data Interface
export interface LeadConversionData {
  leadId: string;
  convertedBy: string;
  conversionDate: string;
  conversionNotes?: string;
  initialFeeEstimate?: number;
  engagementLetter?: string;
  feeAgreement?: string;
  matterType?: string;
  estimatedDuration?: number;
  estimatedValue?: number;
}

// Lead Communication Interface
export interface LeadCommunication {
  id: string;
  leadId: string;
  type: 'email' | 'phone' | 'text' | 'meeting' | 'letter';
  direction: 'inbound' | 'outbound';
  subject?: string;
  content: string;
  participants: string[];
  timestamp: string;
  createdBy: string;
  metadata?: Record<string, any>;
}

// Lead Timeline Event Interface
export interface LeadTimelineEvent {
  id: string;
  leadId: string;
  eventType: 'status_change' | 'stage_change' | 'activity' | 'communication' | 'note' | 'task';
  title: string;
  description?: string;
  timestamp: string;
  createdBy: string;
  metadata?: Record<string, any>;
}

// Lead Report Interface
export interface LeadReport {
  id: string;
  name: string;
  type: 'conversion' | 'source_performance' | 'attorney_performance' | 'pipeline' | 'custom';
  parameters: Record<string, any>;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Export default lead management configuration
export const DEFAULT_LEAD_SOURCES: Omit<LeadSource, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Website Contact Form',
    category: 'organic',
    description: 'Leads from website contact form submissions',
    isActive: true
  },
  {
    name: 'Phone Inquiry',
    category: 'organic',
    description: 'Direct phone calls to the office',
    isActive: true
  },
  {
    name: 'Client Referral',
    category: 'referral',
    description: 'Referrals from existing clients',
    isActive: true
  },
  {
    name: 'Attorney Referral',
    category: 'referral',
    description: 'Referrals from other attorneys',
    isActive: true
  },
  {
    name: 'Google Ads',
    category: 'advertising',
    description: 'Leads from Google Ads campaigns',
    isActive: true
  },
  {
    name: 'Social Media',
    category: 'social_media',
    description: 'Leads from social media platforms',
    isActive: true
  },
  {
    name: 'Networking Events',
    category: 'networking',
    description: 'Leads from professional networking events',
    isActive: true
  },
  {
    name: 'Email Marketing',
    category: 'marketing',
    description: 'Leads from email marketing campaigns',
    isActive: true
  }
];

export const DEFAULT_INTAKE_STAGES: IntakeWorkflowStage[] = [
  {
    id: 'initial',
    name: 'Initial Contact',
    description: 'Lead captured and initial information gathered',
    requiredFields: ['name', 'email', 'phone'],
    autoAdvance: false,
    estimatedDuration: 15
  },
  {
    id: 'qualification',
    name: 'Qualification',
    description: 'Pre-screening and lead scoring',
    requiredFields: ['lead_score', 'matter_type'],
    autoAdvance: false,
    estimatedDuration: 30
  },
  {
    id: 'conflict_check',
    name: 'Conflict Check',
    description: 'Conflict of interest verification',
    requiredFields: ['conflict_check_status'],
    autoAdvance: true,
    estimatedDuration: 10
  },
  {
    id: 'consultation',
    name: 'Consultation',
    description: 'Initial consultation scheduled and completed',
    requiredFields: ['consultation_date', 'consultation_notes'],
    autoAdvance: false,
    estimatedDuration: 60
  },
  {
    id: 'proposal',
    name: 'Proposal',
    description: 'Fee agreement and engagement letter prepared',
    requiredFields: ['fee_agreement', 'engagement_letter'],
    autoAdvance: false,
    estimatedDuration: 45
  },
  {
    id: 'onboarding',
    name: 'Client Onboarding',
    description: 'Client setup and matter creation',
    requiredFields: ['client_portal_access', 'matter_created'],
    autoAdvance: false,
    estimatedDuration: 30
  },
  {
    id: 'completed',
    name: 'Completed',
    description: 'Intake process completed successfully',
    requiredFields: [],
    autoAdvance: true,
    estimatedDuration: 0
  }
];