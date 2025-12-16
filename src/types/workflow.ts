export type WorkflowCategory = 'general' | 'transactional' | 'litigation' | 'financial' | 'compliance';

export type WorkflowStepType = 'input' | 'analysis' | 'generation' | 'review' | 'upload';

export type WorkflowStatus = 'not_started' | 'in_progress' | 'paused' | 'completed' | 'failed';

export type InputType = 'text' | 'file' | 'document' | 'selection' | 'confirmation';

export type OutputType = 'document' | 'analysis' | 'table' | 'report' | 'timeline' | 'summary';

export interface InputRequirement {
  id: string;
  type: InputType;
  label: string;
  description: string;
  required: boolean;
  fileTypes?: string[];
  maxFileSize?: number;
  placeholder?: string;
  options?: { value: string; label: string; }[];
}

export interface OutputExpected {
  type: OutputType;
  format: string;
  description: string;
}

export interface ValidationRule {
  type: 'required' | 'fileSize' | 'fileType' | 'minLength' | 'maxLength';
  value?: any;
  message: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: WorkflowStepType;
  order: number;
  prompt?: string;
  inputs: InputRequirement[];
  expectedOutputs: OutputExpected[];
  validations?: ValidationRule[];
  estimatedTime?: string;
  isOptional?: boolean;
  dependencies?: string[]; // IDs of steps that must be completed first
}

export interface WorkflowTemplate {
  id: string;
  title: string;
  description: string;
  category: WorkflowCategory;
  steps: WorkflowStep[];
  estimatedTotalTime: string;
  icon: string;
  color: string;
  tags: string[];
  complexity: 'simple' | 'moderate' | 'complex';
  createdAt: string;
  updatedAt: string;
  version: string;
  isActive: boolean;
}

export interface StepInput {
  stepId: string;
  inputId: string;
  value: any;
  files?: File[];
  timestamp: string;
}

export interface StepOutput {
  stepId: string;
  type: OutputType;
  content: any;
  metadata?: Record<string, any>;
  timestamp: string;
  exportable: boolean;
}

export interface WorkflowExecution {
  id: string;
  templateId: string;
  title: string;
  status: WorkflowStatus;
  currentStep: number;
  startedAt: string;
  completedAt?: string;
  pausedAt?: string;
  context: Record<string, any>;
  inputs: StepInput[];
  outputs: StepOutput[];
  conversationId?: string;
  userId: string;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  timeSpent?: number; // in milliseconds
  estimatedTimeRemaining?: number;
}

export interface WorkflowFilters {
  category?: WorkflowCategory;
  complexity?: 'simple' | 'moderate' | 'complex';
  tags?: string[];
  search?: string;
  estimatedTime?: {
    min: number;
    max: number;
  };
}

export interface WorkflowMetrics {
  totalExecutions: number;
  averageCompletionTime: number;
  successRate: number;
  popularSteps: string[];
  userSatisfactionScore?: number;
}

export interface ExportOptions {
  format: 'pdf' | 'docx' | 'html' | 'json';
  includeInputs: boolean;
  includeMetadata: boolean;
  templateStyle: 'legal' | 'business' | 'minimal';
  sections: {
    summary: boolean;
    steps: boolean;
    outputs: boolean;
    timeline: boolean;
  };
}

export interface WorkflowProgress {
  currentStepIndex: number;
  completedSteps: string[];
  pendingSteps: string[];
  skippedSteps: string[];
  totalSteps: number;
  isComplete: boolean;
  canProceed: boolean;
  nextStepId?: string;
}