
export type MatterStatus = 'active' | 'closed' | 'pending' | 'on_hold';
export type MatterPriority = 'low' | 'medium' | 'high' | 'urgent';
export type MatterStage = 'open' | 'discovery' | 'mediation' | 'trial' | 'settlement' | 'appeal' | 'closed';

export interface MatterTemplate {
  id: string;
  name: string;
  description: string;
  practiceArea: string;
  defaultFields: Partial<NewMatterData>;
  customFields: CustomField[];
  taskLists: TaskList[];
  documentFolders: DocumentFolder[];
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'dropdown' | 'checkbox' | 'textarea';
  required: boolean;
  options?: string[]; // for dropdown fields
  helpText?: string;
  value?: any;
}

export interface TaskList {
  id: string;
  name: string;
  tasks: Task[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: MatterPriority;
  assignedTo?: string;
  completed: boolean;
}

export interface DocumentFolder {
  id: string;
  name: string;
  description?: string;
  accessLevel: 'public' | 'restricted' | 'private';
  subfolders?: DocumentFolder[];
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  deadlineReminders: boolean;
  clientNotifications: boolean;
  taskNotifications: boolean;
}

export interface BillingPreference {
  method: 'hourly' | 'flat_fee' | 'contingency' | 'retainer';
  hourlyRate?: number;
  flatFeeAmount?: number;
  contingencyPercentage?: number;
  retainerAmount?: number;
  expenseTracking: boolean;
}

export interface MatterPermissions {
  fileAccess: 'full' | 'limited' | 'none';
  clientPortalAccess: boolean;
  documentSharing: boolean;
  allowedUsers: string[];
}

export interface RelatedContact {
  id: string;
  contactId: string;
  contactName: string;
  relationship: 'expert_witness' | 'consultant' | 'opposing_counsel' | 'court_reporter' | 'other';
  role?: string;
  email?: string;
  phone?: string;
}

export interface Matter {
  id: string;
  title: string;
  description: string;
  clientId: string;
  clientName: string;
  status: MatterStatus;
  priority: MatterPriority;
  stage: MatterStage;
  practiceArea: string;
  practiceSubArea?: string;
  responsibleAttorney: string;
  responsibleAttorneyId: string;
  originatingAttorney?: string;
  originatingAttorneyId?: string;
  responsibleStaff: string[];
  responsibleStaffIds: string[];
  dateOpened: string;
  dateClosed?: string;
  lastActivity: string;
  billedAmount: number;
  estimatedBudget?: number;
  timeSpent: number; // in hours
  nextActionDate?: string;
  tags: string[];
  notes?: string;
  matterNumber?: string;
  templateId?: string;
  customFields: { [key: string]: any };
  notificationSettings: NotificationSettings;
  billingPreference: BillingPreference;
  permissions: MatterPermissions;
  relatedContacts: RelatedContact[];
  taskLists: TaskList[];
  documentFolders: DocumentFolder[];
  notificationCount: number;
}

export interface NewMatterData {
  title: string;
  description: string;
  clientId: string;
  priority: MatterPriority;
  stage: MatterStage;
  practiceArea: string;
  practiceSubArea?: string;
  responsibleAttorney: string;
  responsibleAttorneyId: string;
  originatingAttorney?: string;
  originatingAttorneyId?: string;
  responsibleStaff: string[];
  responsibleStaffIds: string[];
  estimatedBudget?: number;
  nextActionDate?: string;
  tags: string[];
  notes?: string;
  matterNumber?: string;
  templateId?: string;
  customFields: { [key: string]: any };
  notificationSettings: NotificationSettings;
  billingPreference: BillingPreference;
  permissions: MatterPermissions;
  relatedContacts: RelatedContact[];
  taskLists: TaskList[];
  documentFolders: DocumentFolder[];
}

export interface MatterFilters {
  status?: MatterStatus[];
  priority?: MatterPriority[];
  practiceArea?: string[];
  responsibleAttorney?: string[];
  clientId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}
