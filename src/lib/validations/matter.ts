import { z } from 'zod';
import { MatterPriority, MatterStage } from '@/types/matter';

// Helper validation functions
const phoneRegex = /^(\+\d{1,3}[- ]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Sanitization helper to prevent XSS
export const sanitizeString = (str: string): string => {
  return str
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove on* event handlers
    .trim();
};

// Custom field validation schema
export const customFieldSchema = z.object({
  id: z.string().min(1, 'Custom field ID is required'),
  name: z.string()
    .min(1, 'Field name is required')
    .max(100, 'Field name must be less than 100 characters')
    .transform(sanitizeString),
  type: z.enum(['text', 'number', 'date', 'dropdown', 'checkbox', 'textarea']),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
  helpText: z.string()
    .max(500, 'Help text must be less than 500 characters')
    .transform(sanitizeString)
    .optional(),
  value: z.any().optional()
});

// Related contact validation schema
export const relatedContactSchema = z.object({
  id: z.string().min(1, 'Contact ID is required'),
  contactId: z.string().min(1, 'Contact reference ID is required'),
  contactName: z.string()
    .min(1, 'Contact name is required')
    .max(200, 'Contact name must be less than 200 characters')
    .transform(sanitizeString),
  relationship: z.enum(['expert_witness', 'consultant', 'opposing_counsel', 'court_reporter', 'other']),
  role: z.string()
    .max(100, 'Role must be less than 100 characters')
    .transform(sanitizeString)
    .optional(),
  email: z.string()
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .regex(phoneRegex, 'Invalid phone number format')
    .optional()
    .or(z.literal(''))
});

// Task validation schema
export const taskSchema = z.object({
  id: z.string().min(1, 'Task ID is required'),
  title: z.string()
    .min(1, 'Task title is required')
    .max(200, 'Task title must be less than 200 characters')
    .transform(sanitizeString),
  description: z.string()
    .max(1000, 'Task description must be less than 1000 characters')
    .transform(sanitizeString)
    .optional(),
  dueDate: z.string()
    .refine((date) => {
      if (!date) return true;
      const parsedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return parsedDate >= today;
    }, 'Due date cannot be in the past')
    .optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent'] as const),
  assignedTo: z.string()
    .max(200, 'Assigned to must be less than 200 characters')
    .transform(sanitizeString)
    .optional(),
  completed: z.boolean()
});

// Task list validation schema
export const taskListSchema = z.object({
  id: z.string().min(1, 'Task list ID is required'),
  name: z.string()
    .min(1, 'Task list name is required')
    .max(100, 'Task list name must be less than 100 characters')
    .transform(sanitizeString),
  tasks: z.array(taskSchema)
});

// Document folder validation schema
export const documentFolderSchema = z.object({
  id: z.string().min(1, 'Document folder ID is required'),
  name: z.string()
    .min(1, 'Folder name is required')
    .max(100, 'Folder name must be less than 100 characters')
    .transform(sanitizeString),
  description: z.string()
    .max(500, 'Folder description must be less than 500 characters')
    .transform(sanitizeString)
    .optional(),
  accessLevel: z.enum(['public', 'restricted', 'private']),
  subfolders: z.array(z.lazy(() => documentFolderSchema)).optional()
});

// Notification settings validation schema
export const notificationSettingsSchema = z.object({
  email: z.boolean(),
  sms: z.boolean(),
  deadlineReminders: z.boolean(),
  clientNotifications: z.boolean(),
  taskNotifications: z.boolean()
});

// Billing preference validation schema
export const billingPreferenceSchema = z.object({
  method: z.enum(['hourly', 'flat_fee', 'contingency', 'retainer']),
  hourlyRate: z.number()
    .min(0, 'Hourly rate must be positive')
    .max(10000, 'Hourly rate must be less than $10,000')
    .optional(),
  flatFeeAmount: z.number()
    .min(0, 'Flat fee amount must be positive')
    .max(10000000, 'Flat fee amount must be less than $10,000,000')
    .optional(),
  contingencyPercentage: z.number()
    .min(0, 'Contingency percentage must be positive')
    .max(100, 'Contingency percentage cannot exceed 100%')
    .optional(),
  retainerAmount: z.number()
    .min(0, 'Retainer amount must be positive')
    .max(10000000, 'Retainer amount must be less than $10,000,000')
    .optional(),
  expenseTracking: z.boolean()
}).refine((data) => {
  // Validate that appropriate fields are provided for each billing method
  switch (data.method) {
    case 'hourly':
      return data.hourlyRate !== undefined && data.hourlyRate > 0;
    case 'flat_fee':
      return data.flatFeeAmount !== undefined && data.flatFeeAmount > 0;
    case 'contingency':
      return data.contingencyPercentage !== undefined && data.contingencyPercentage > 0;
    case 'retainer':
      return data.retainerAmount !== undefined && data.retainerAmount > 0;
    default:
      return true;
  }
}, {
  message: 'Required billing information missing for selected method'
});

// Matter permissions validation schema
export const matterPermissionsSchema = z.object({
  fileAccess: z.enum(['full', 'limited', 'none']),
  clientPortalAccess: z.boolean(),
  documentSharing: z.boolean(),
  allowedUsers: z.array(z.string().min(1, 'User ID cannot be empty'))
});

// Base matter schema without refinements
const baseMatterSchema = z.object({
  title: z.string()
    .min(1, 'Matter title is required')
    .max(200, 'Matter title must be less than 200 characters')
    .transform(sanitizeString),
  description: z.string()
    .max(2000, 'Matter description must be less than 2000 characters')
    .transform(sanitizeString)
    .optional(),
  clientId: z.string()
    .min(1, 'Client selection is required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent'] as const),
  stage: z.enum(['open', 'discovery', 'mediation', 'trial', 'settlement', 'appeal', 'closed'] as const),
  practiceArea: z.string()
    .min(1, 'Practice area is required')
    .max(100, 'Practice area must be less than 100 characters'),
  practiceSubArea: z.string()
    .max(100, 'Practice sub-area must be less than 100 characters')
    .optional(),
  responsibleAttorney: z.string()
    .min(1, 'Responsible attorney is required')
    .max(200, 'Attorney name must be less than 200 characters')
    .transform(sanitizeString),
  responsibleAttorneyId: z.string()
    .min(1, 'Responsible attorney ID is required'),
  originatingAttorney: z.string()
    .max(200, 'Attorney name must be less than 200 characters')
    .transform(sanitizeString)
    .optional(),
  originatingAttorneyId: z.string().optional(),
  responsibleStaff: z.array(
    z.string()
      .max(200, 'Staff name must be less than 200 characters')
      .transform(sanitizeString)
  ),
  responsibleStaffIds: z.array(z.string()),
  estimatedBudget: z.number()
    .min(0, 'Estimated budget must be positive')
    .max(100000000, 'Estimated budget must be less than $100,000,000')
    .optional(),
  nextActionDate: z.string()
    .refine((date) => {
      if (!date) return true;
      const parsedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return parsedDate >= today;
    }, 'Next action date cannot be in the past')
    .optional(),
  tags: z.array(
    z.string()
      .min(1, 'Tag cannot be empty')
      .max(50, 'Tag must be less than 50 characters')
      .transform(sanitizeString)
      .refine((tag) => {
        // Prevent malicious content in tags
        const dangerousPatterns = /<[^>]*>|javascript:|on\w+=/gi;
        return !dangerousPatterns.test(tag);
      }, 'Invalid tag content')
  ),
  notes: z.string()
    .max(5000, 'Notes must be less than 5000 characters')
    .transform(sanitizeString)
    .optional(),
  matterNumber: z.string()
    .max(50, 'Matter number must be less than 50 characters')
    .optional(),
  templateId: z.string().optional(),
  customFields: z.record(z.any()),
  notificationSettings: notificationSettingsSchema,
  billingPreference: billingPreferenceSchema,
  permissions: matterPermissionsSchema,
  relatedContacts: z.array(relatedContactSchema),
  taskLists: z.array(taskListSchema),
  documentFolders: z.array(documentFolderSchema)
});

// Main new matter data validation schema with refinements
export const newMatterSchema = baseMatterSchema.refine((data) => {
  // Ensure staff arrays are synchronized
  return data.responsibleStaff.length === data.responsibleStaffIds.length;
}, {
  message: 'Staff names and IDs must be synchronized',
  path: ['responsibleStaff']
});

// Validation for matter update (partial data)
export const updateMatterSchema = baseMatterSchema.partial().extend({
  id: z.string().min(1, 'Matter ID is required')
});

// Validation for matter filters
export const matterFiltersSchema = z.object({
  status: z.array(z.enum(['active', 'closed', 'pending', 'on_hold'])).optional(),
  priority: z.array(z.enum(['low', 'medium', 'high', 'urgent'])).optional(),
  practiceArea: z.array(z.string()).optional(),
  responsibleAttorney: z.array(z.string()).optional(),
  clientId: z.string().optional(),
  dateRange: z.object({
    start: z.string(),
    end: z.string()
  }).refine((range) => {
    const startDate = new Date(range.start);
    const endDate = new Date(range.end);
    return startDate <= endDate;
  }, 'Start date must be before end date').optional()
});

// Export types inferred from schemas
export type NewMatterFormData = z.infer<typeof newMatterSchema>;
export type UpdateMatterFormData = z.infer<typeof updateMatterSchema>;
export type MatterFiltersData = z.infer<typeof matterFiltersSchema>;
export type CustomFieldData = z.infer<typeof customFieldSchema>;
export type RelatedContactData = z.infer<typeof relatedContactSchema>;
export type TaskData = z.infer<typeof taskSchema>;
export type TaskListData = z.infer<typeof taskListSchema>;
export type DocumentFolderData = z.infer<typeof documentFolderSchema>;

// Validation helper functions
export const validateMatterForm = (data: unknown) => {
  return newMatterSchema.safeParse(data);
};

export const validateMatterUpdate = (data: unknown) => {
  return updateMatterSchema.safeParse(data);
};

export const validateMatterFilters = (data: unknown) => {
  return matterFiltersSchema.safeParse(data);
};

// Duplicate matter detection helpers
export const checkDuplicateMatter = async (
  title: string, 
  clientId: string, 
  excludeMatterId?: string
): Promise<boolean> => {
  // This would typically check against a database
  // For now, return false (no duplicates) as this is mock data
  console.log('Checking for duplicate matter:', { title, clientId, excludeMatterId });
  return false;
};

// Matter number generation
export const generateMatterNumber = (): string => {
  const year = new Date().getFullYear().toString().slice(-2);
  const timestamp = Date.now().toString().slice(-6);
  return `M${year}${timestamp}`;
};

// Date validation helpers
export const isValidFutureDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today && !isNaN(date.getTime());
};

// Budget validation helpers
export const isValidBudget = (budget: number): boolean => {
  return budget >= 0 && budget <= 100000000 && Number.isFinite(budget);
};

// Attorney validation helpers
export const validateAttorneyAssignment = (
  responsibleAttorneyId: string,
  originatingAttorneyId?: string
): { valid: boolean; error?: string } => {
  if (!responsibleAttorneyId) {
    return { valid: false, error: 'Responsible attorney is required' };
  }
  
  if (originatingAttorneyId && responsibleAttorneyId === originatingAttorneyId) {
    return { valid: false, error: 'Responsible and originating attorney cannot be the same person' };
  }
  
  return { valid: true };
};