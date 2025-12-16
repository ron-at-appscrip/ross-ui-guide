// Base template and types
export { BaseEmailTemplate, type BaseEmailProps } from './BaseEmailTemplate';

// Invoice email template
export { 
  InvoiceEmailTemplate, 
  type InvoiceEmailProps, 
  type InvoiceLineItem 
} from './InvoiceEmailTemplate';

// Client communication template
export { 
  ClientCommunicationTemplate, 
  type ClientCommunicationProps, 
  type AttachmentInfo 
} from './ClientCommunicationTemplate';

// Matter update template
export { 
  MatterUpdateTemplate, 
  type MatterUpdateProps, 
  type MatterMilestone,
  type UpcomingDeadline 
} from './MatterUpdateTemplate';

// Welcome client template
export { 
  WelcomeClientTemplate, 
  type WelcomeClientProps, 
  type WelcomeResource,
  type TeamMember 
} from './WelcomeClientTemplate';

// Template registry for dynamic template selection
export const EMAIL_TEMPLATES = {
  invoice: InvoiceEmailTemplate,
  communication: ClientCommunicationTemplate,
  matterUpdate: MatterUpdateTemplate,
  welcome: WelcomeClientTemplate,
} as const;

export type EmailTemplateType = keyof typeof EMAIL_TEMPLATES;

// Utility functions for template management
export const getEmailTemplate = (type: EmailTemplateType) => {
  return EMAIL_TEMPLATES[type];
};

export const getAvailableTemplates = () => {
  return Object.keys(EMAIL_TEMPLATES) as EmailTemplateType[];
};

// Template metadata for UI display
export const EMAIL_TEMPLATE_METADATA = {
  invoice: {
    name: 'Invoice Email',
    description: 'Professional invoice with line items and payment instructions',
    category: 'billing',
    icon: '💰',
  },
  communication: {
    name: 'Client Communication',
    description: 'General client communication with matter context',
    category: 'communication',
    icon: '💬',
  },
  matterUpdate: {
    name: 'Matter Update',
    description: 'Case status update with milestones and deadlines',
    category: 'case-management',
    icon: '📋',
  },
  welcome: {
    name: 'Welcome Client',
    description: 'New client onboarding with team and resources',
    category: 'onboarding',
    icon: '🎉',
  },
} as const;