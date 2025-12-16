import { MatterPriority } from './matter';

// Task status for better tracking
export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'cancelled' | 'blocked';

// Task categories for organization
export type TaskCategory = 'court_filing' | 'client_communication' | 'document_preparation' | 
  'research' | 'discovery' | 'administrative' | 'deadline' | 'meeting' | 'review' | 'other';

// Recurrence patterns
export type RecurrencePattern = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

export interface TaskRecurrence {
  pattern: RecurrencePattern;
  interval?: number; // For custom patterns
  endDate?: string; // When recurrence ends
  daysOfWeek?: number[]; // 0-6 for weekly patterns
  dayOfMonth?: number; // For monthly patterns
  maxOccurrences?: number;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  type: string; // MIME type
}

export interface TaskComment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  mentions?: string[]; // User IDs mentioned
  attachments?: TaskAttachment[];
}

export interface TaskReminder {
  id: string;
  reminderDate: string;
  reminderType: 'email' | 'sms' | 'notification';
  recipientIds: string[];
  message?: string;
  sent: boolean;
}

export interface TaskDependency {
  dependsOnTaskId: string;
  dependencyType: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  lagDays?: number; // Days to wait after dependency is met
}

export interface TaskHistory {
  id: string;
  action: 'created' | 'updated' | 'completed' | 'reopened' | 'assigned' | 'commented';
  userId: string;
  userName: string;
  timestamp: string;
  changes?: Record<string, { from: any; to: any }>;
  comment?: string;
}

// Enhanced Task interface
export interface Task {
  id: string;
  matterId: string;
  matterTitle?: string;
  clientName?: string;
  
  // Basic info
  title: string;
  description?: string;
  category: TaskCategory;
  status: TaskStatus;
  priority: MatterPriority;
  
  // Dates and timing
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  dueTime?: string; // Specific time of day
  startDate?: string;
  completedAt?: string;
  estimatedHours?: number;
  actualHours?: number;
  
  // Assignment
  assignedTo?: string;
  assignedToName?: string;
  assignedBy?: string;
  assignedByName?: string;
  assignedAt?: string;
  
  // Advanced features
  dependencies?: TaskDependency[];
  blockedBy?: string[]; // Task IDs blocking this task
  blocking?: string[]; // Task IDs this task is blocking
  recurrence?: TaskRecurrence;
  reminders?: TaskReminder[];
  
  // Collaboration
  watchers?: string[]; // User IDs watching this task
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
  tags?: string[];
  
  // Tracking
  history?: TaskHistory[];
  lastModifiedBy?: string;
  
  // Workflow
  workflowId?: string;
  workflowStepId?: string;
  isAutomated?: boolean;
  automationTrigger?: string;
  
  // Custom fields
  customFields?: Record<string, any>;
}

// Task list with metadata
export interface TaskList {
  id: string;
  name: string;
  description?: string;
  matterId?: string;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isTemplate?: boolean;
  practiceArea?: string;
}

// Workflow template for automated task creation
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  practiceArea: string;
  practiceSubArea?: string;
  isActive: boolean;
  
  // Template metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: number;
  
  // Workflow steps
  steps: WorkflowStep[];
  
  // Automation rules
  triggers?: WorkflowTrigger[];
  
  // Usage tracking
  timesUsed?: number;
  lastUsed?: string;
  
  // Custom settings
  settings?: {
    autoAssignTasks?: boolean;
    notifyOnTaskCreation?: boolean;
    skipCompletedSteps?: boolean;
  };
}

export interface WorkflowStep {
  id: string;
  order: number;
  name: string;
  description?: string;
  
  // Task template for this step
  taskTemplate: Partial<Task>;
  
  // Step configuration
  isRequired: boolean;
  canSkip: boolean;
  autoComplete?: boolean;
  
  // Dependencies
  dependsOn?: string[]; // Other step IDs
  
  // Timing
  daysFromMatterOpen?: number;
  daysFromPreviousStep?: number;
  daysBeforeDeadline?: number;
  
  // Assignment rules
  assignmentRule?: {
    type: 'role' | 'specific_user' | 'round_robin' | 'workload_based';
    roleId?: string;
    userId?: string;
    userIds?: string[]; // For round robin
  };
  
  // Conditions
  conditions?: WorkflowCondition[];
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface WorkflowTrigger {
  id: string;
  type: 'matter_created' | 'matter_stage_changed' | 'date_based' | 'task_completed' | 'custom';
  conditions?: WorkflowCondition[];
  actions: WorkflowAction[];
}

export interface WorkflowAction {
  type: 'create_task' | 'update_task' | 'send_notification' | 'update_matter';
  config: Record<string, any>;
}

// Task creation data
export interface NewTaskData {
  title: string;
  description?: string;
  category: TaskCategory;
  priority: MatterPriority;
  dueDate?: string;
  dueTime?: string;
  startDate?: string;
  estimatedHours?: number;
  assignedTo?: string;
  tags?: string[];
  reminders?: Omit<TaskReminder, 'id' | 'sent'>[];
  recurrence?: TaskRecurrence;
  dependencies?: TaskDependency[];
  attachments?: File[];
  customFields?: Record<string, any>;
}

// Task filters for search/display
export interface TaskFilters {
  status?: TaskStatus[];
  priority?: MatterPriority[];
  category?: TaskCategory[];
  assignedTo?: string[];
  matterId?: string;
  dueDate?: {
    start: string;
    end: string;
  };
  tags?: string[];
  hasAttachments?: boolean;
  isOverdue?: boolean;
  isRecurring?: boolean;
}

// Task statistics
export interface TaskStats {
  total: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<MatterPriority, number>;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
  completedThisWeek: number;
  averageCompletionTime: number; // in hours
}

// Predefined task templates for common legal tasks
export const LEGAL_TASK_TEMPLATES: Partial<Task>[] = [
  {
    title: 'Initial Client Meeting',
    category: 'meeting',
    description: 'Conduct initial consultation with client to understand case details and objectives',
    estimatedHours: 1.5,
    priority: 'high'
  },
  {
    title: 'Conflict Check',
    category: 'administrative',
    description: 'Perform conflict of interest check before accepting representation',
    estimatedHours: 0.5,
    priority: 'urgent'
  },
  {
    title: 'Engagement Letter',
    category: 'document_preparation',
    description: 'Prepare and send engagement letter to client',
    estimatedHours: 1,
    priority: 'high'
  },
  {
    title: 'Court Filing Deadline',
    category: 'court_filing',
    description: 'File necessary documents with the court',
    estimatedHours: 2,
    priority: 'urgent'
  },
  {
    title: 'Discovery Response',
    category: 'discovery',
    description: 'Prepare and submit discovery responses',
    estimatedHours: 4,
    priority: 'high'
  },
  {
    title: 'Legal Research',
    category: 'research',
    description: 'Research relevant case law and statutes',
    estimatedHours: 3,
    priority: 'medium'
  },
  {
    title: 'Client Status Update',
    category: 'client_communication',
    description: 'Provide regular update to client on case progress',
    estimatedHours: 0.5,
    priority: 'medium',
    recurrence: {
      pattern: 'biweekly'
    }
  },
  {
    title: 'Document Review',
    category: 'review',
    description: 'Review and analyze case documents',
    estimatedHours: 2,
    priority: 'medium'
  }
];