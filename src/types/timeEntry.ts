export interface TimeEntry {
  id: string;
  matterId: string;
  attorneyId: string;
  attorneyName: string;
  date: string;
  startTime?: string;
  endTime?: string;
  hours: number;
  description: string;
  activityType: string;
  rate: number;
  billable: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TimeEntryData {
  matterId: string;
  description: string;
  hours: number;
  rate: number;
  date: string;
  billable: boolean;
  activityType: string;
  tags: string[];
}

export interface TimeEntryTemplate {
  id: string;
  name: string;
  activityType: string;
  defaultHours: number;
  description: string;
  billable: boolean;
  estimatedDuration: string;
}

export interface ActivityType {
  id: string;
  name: string;
  description: string;
  defaultBillable: boolean;
  color: string;
  category: 'client_service' | 'case_work' | 'administrative' | 'business_development';
}

export const LEGAL_ACTIVITY_TYPES: ActivityType[] = [
  {
    id: 'client_communication',
    name: 'Client Communication',
    description: 'Phone calls, emails, meetings with clients',
    defaultBillable: true,
    color: 'bg-blue-100 text-blue-800',
    category: 'client_service'
  },
  {
    id: 'legal_research',
    name: 'Legal Research',
    description: 'Case law research, statute analysis, legal precedent review',
    defaultBillable: true,
    color: 'bg-green-100 text-green-800',
    category: 'case_work'
  },
  {
    id: 'document_drafting',
    name: 'Document Drafting',
    description: 'Contracts, pleadings, motions, briefs, letters',
    defaultBillable: true,
    color: 'bg-purple-100 text-purple-800',
    category: 'case_work'
  },
  {
    id: 'document_review',
    name: 'Document Review',
    description: 'Contract review, discovery document analysis',
    defaultBillable: true,
    color: 'bg-yellow-100 text-yellow-800',
    category: 'case_work'
  },
  {
    id: 'court_appearance',
    name: 'Court Appearance',
    description: 'Hearings, trials, depositions, mediation',
    defaultBillable: true,
    color: 'bg-red-100 text-red-800',
    category: 'case_work'
  },
  {
    id: 'case_strategy',
    name: 'Case Strategy',
    description: 'Strategic planning, case analysis, team meetings',
    defaultBillable: true,
    color: 'bg-indigo-100 text-indigo-800',
    category: 'case_work'
  },
  {
    id: 'discovery',
    name: 'Discovery',
    description: 'Interrogatories, depositions, document production',
    defaultBillable: true,
    color: 'bg-orange-100 text-orange-800',
    category: 'case_work'
  },
  {
    id: 'negotiations',
    name: 'Negotiations',
    description: 'Settlement negotiations, contract negotiations',
    defaultBillable: true,
    color: 'bg-teal-100 text-teal-800',
    category: 'client_service'
  },
  {
    id: 'administrative',
    name: 'Administrative',
    description: 'File organization, billing, scheduling',
    defaultBillable: false,
    color: 'bg-gray-100 text-gray-800',
    category: 'administrative'
  },
  {
    id: 'travel',
    name: 'Travel',
    description: 'Travel time for client meetings, court appearances',
    defaultBillable: true,
    color: 'bg-pink-100 text-pink-800',
    category: 'client_service'
  }
];

export const TIME_ENTRY_TEMPLATES: TimeEntryTemplate[] = [
  {
    id: 'client_call_15',
    name: 'Client Phone Call (Quick)',
    activityType: 'client_communication',
    defaultHours: 0.25,
    description: 'Brief phone call with client regarding case status',
    billable: true,
    estimatedDuration: '15 minutes'
  },
  {
    id: 'client_meeting_1h',
    name: 'Client Meeting',
    activityType: 'client_communication',
    defaultHours: 1.0,
    description: 'In-person or video meeting with client',
    billable: true,
    estimatedDuration: '1 hour'
  },
  {
    id: 'research_session',
    name: 'Legal Research Session',
    activityType: 'legal_research',
    defaultHours: 2.0,
    description: 'Comprehensive legal research on case issues',
    billable: true,
    estimatedDuration: '2 hours'
  },
  {
    id: 'document_review_1h',
    name: 'Document Review',
    activityType: 'document_review',
    defaultHours: 1.0,
    description: 'Review and analysis of client documents',
    billable: true,
    estimatedDuration: '1 hour'
  },
  {
    id: 'contract_drafting',
    name: 'Contract Drafting',
    activityType: 'document_drafting',
    defaultHours: 3.0,
    description: 'Draft new contract or agreement',
    billable: true,
    estimatedDuration: '3 hours'
  },
  {
    id: 'court_hearing',
    name: 'Court Hearing',
    activityType: 'court_appearance',
    defaultHours: 2.0,
    description: 'Attendance at court hearing or proceeding',
    billable: true,
    estimatedDuration: '2 hours'
  },
  {
    id: 'email_correspondence',
    name: 'Email Correspondence',
    activityType: 'client_communication',
    defaultHours: 0.1,
    description: 'Email correspondence with client or opposing counsel',
    billable: true,
    estimatedDuration: '6 minutes'
  },
  {
    id: 'case_strategy_meeting',
    name: 'Case Strategy Meeting',
    activityType: 'case_strategy',
    defaultHours: 1.5,
    description: 'Team meeting to discuss case strategy and next steps',
    billable: true,
    estimatedDuration: '1.5 hours'
  }
];

export const MOCK_TIME_ENTRIES: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    matterId: '1',
    attorneyId: '1',
    attorneyName: 'Sarah Johnson',
    date: '2024-12-13',
    startTime: '09:00',
    endTime: '10:30',
    hours: 1.5,
    description: 'Client meeting to discuss merger timeline and regulatory requirements',
    activityType: 'client_communication',
    rate: 650,
    billable: true,
    tags: ['merger', 'client-meeting']
  },
  {
    matterId: '1',
    attorneyId: '1',
    attorneyName: 'Sarah Johnson',
    date: '2024-12-12',
    hours: 3.0,
    description: 'Legal research on SEC compliance requirements for technology acquisitions',
    activityType: 'legal_research',
    rate: 650,
    billable: true,
    tags: ['research', 'SEC', 'compliance']
  },
  {
    matterId: '2',
    attorneyId: '2',
    attorneyName: 'Michael Rodriguez',
    date: '2024-12-13',
    hours: 2.5,
    description: 'Draft motion for summary judgment in employment discrimination case',
    activityType: 'document_drafting',
    rate: 550,
    billable: true,
    tags: ['motion', 'employment', 'litigation']
  },
  {
    matterId: '3',
    attorneyId: '3',
    attorneyName: 'Jennifer Kim',
    date: '2024-12-13',
    hours: 1.0,
    description: 'Review purchase agreement and negotiate terms with seller counsel',
    activityType: 'document_review',
    rate: 500,
    billable: true,
    tags: ['real-estate', 'contract-review']
  }
];