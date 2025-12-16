/**
 * Field Help Text Database
 * Provides contextual information for all form fields
 */

export interface FieldHelpText {
  title: string;
  description: string;
  examples?: string[];
  required?: boolean;
  category: 'basic' | 'billing' | 'team' | 'legal' | 'notifications' | 'permissions' | 'custom';
}

export const fieldHelpTexts: Record<string, FieldHelpText> = {
  // Basic Information
  title: {
    title: "Matter Title",
    description: "A descriptive name that clearly identifies this legal matter",
    examples: ["Corporate Merger - ABC Corp", "Employment Dispute - Smith v. Company"],
    required: true,
    category: 'basic'
  },
  
  description: {
    title: "Matter Description", 
    description: "Detailed summary of the legal matter, case background, and objectives",
    examples: ["Acquisition due diligence and documentation", "Wrongful termination defense"],
    required: true,
    category: 'basic'
  },
  
  clientName: {
    title: "Client Name",
    description: "The primary client or organization this matter represents",
    examples: ["GlobalTech Inc.", "John Smith"],
    required: true,
    category: 'basic'
  },
  
  matterNumber: {
    title: "Matter Number",
    description: "Unique identifier for internal tracking and billing purposes",
    examples: ["2024-001", "CORP-240315-001"],
    required: false,
    category: 'basic'
  },
  
  practiceArea: {
    title: "Practice Area",
    description: "The primary legal practice area this matter falls under",
    examples: ["Corporate Law", "Employment Law", "Family Law"],
    required: true,
    category: 'basic'
  },
  
  practiceSubArea: {
    title: "Practice Sub-Area",
    description: "More specific classification within the main practice area",
    examples: ["Mergers & Acquisitions", "Wrongful Termination", "Contract Review"],
    required: false,
    category: 'basic'
  },
  
  status: {
    title: "Matter Status",
    description: "Current operational status of the matter",
    examples: ["Active - work in progress", "On Hold - awaiting client", "Closed - completed"],
    required: true,
    category: 'basic'
  },
  
  priority: {
    title: "Priority Level",
    description: "Urgency level for resource allocation and scheduling",
    examples: ["High - urgent deadline", "Medium - standard timeline", "Low - when time permits"],
    required: true,
    category: 'basic'
  },
  
  stage: {
    title: "Matter Stage",
    description: "Current phase in the legal process or case lifecycle",
    examples: ["Discovery - gathering evidence", "Trial - court proceedings", "Settlement - negotiations"],
    required: true,
    category: 'basic'
  },
  
  // Team and Responsibility
  responsibleAttorney: {
    title: "Responsible Attorney",
    description: "Primary attorney handling this matter with overall accountability",
    examples: ["Sarah Johnson", "Michael Chen"],
    required: true,
    category: 'team'
  },
  
  originatingAttorney: {
    title: "Originating Attorney",
    description: "Attorney who brought in the client or initiated the matter",
    examples: ["David Kim", "Emily Rodriguez"],
    required: false,
    category: 'team'
  },
  
  responsibleStaff: {
    title: "Responsible Staff",
    description: "Paralegals and support staff assigned to assist with this matter",
    examples: ["Jennifer Adams (Paralegal)", "Robert Wilson (Legal Assistant)"],
    required: false,
    category: 'team'
  },
  
  // Legal Details
  statute: {
    title: "Applicable Statute",
    description: "Primary law or regulation governing this matter",
    examples: ["Delaware General Corporation Law", "Title VII Civil Rights Act"],
    required: false,
    category: 'legal'
  },
  
  jurisdiction: {
    title: "Jurisdiction",
    description: "Legal authority or court system with power over this matter",
    examples: ["Delaware", "Federal", "California Superior Court"],
    required: false,
    category: 'legal'
  },
  
  courtVenue: {
    title: "Court Venue",
    description: "Specific court or legal venue where proceedings will take place",
    examples: ["Delaware Court of Chancery", "US District Court Northern District"],
    required: false,
    category: 'legal'
  },
  
  opposingCounsel: {
    title: "Opposing Counsel",
    description: "Law firm or attorney representing the other party",
    examples: ["Wilson & Associates LLP", "Jane Doe, Esq."],
    required: false,
    category: 'legal'
  },
  
  opposingParty: {
    title: "Opposing Party",
    description: "The individual or entity on the other side of this matter",
    examples: ["RegionalTech Solutions", "Former Employee John Smith"],
    required: false,
    category: 'legal'
  },
  
  confidentialityLevel: {
    title: "Confidentiality Level",
    description: "Security classification for handling sensitive information",
    examples: ["Standard - normal protection", "High - extra security measures"],
    required: false,
    category: 'legal'
  },
  
  // Billing and Financial
  estimatedBudget: {
    title: "Estimated Budget",
    description: "Total expected cost for completing this matter",
    examples: ["$50,000 for M&A transaction", "$15,000 for employment defense"],
    required: false,
    category: 'billing'
  },
  
  billingMethod: {
    title: "Billing Method",
    description: "How legal fees will be calculated and charged",
    examples: ["Hourly - time-based billing", "Flat Fee - fixed cost", "Contingency - success-based"],
    required: true,
    category: 'billing'
  },
  
  hourlyRate: {
    title: "Hourly Rate",
    description: "Cost per hour for attorney time on this matter",
    examples: ["$500/hour for partner", "$350/hour for associate"],
    required: false,
    category: 'billing'
  },
  
  flatFee: {
    title: "Flat Fee Amount",
    description: "Fixed total cost for completing the entire matter",
    examples: ["$5,000 for contract review", "$25,000 for trademark registration"],
    required: false,
    category: 'billing'
  },
  
  contingencyRate: {
    title: "Contingency Rate",
    description: "Percentage of recovery paid as legal fees if successful",
    examples: ["33% of settlement", "25% of court award"],
    required: false,
    category: 'billing'
  },
  
  retainerAmount: {
    title: "Retainer Amount",
    description: "Upfront payment to secure legal services",
    examples: ["$10,000 initial retainer", "$25,000 for complex litigation"],
    required: false,
    category: 'billing'
  },
  
  invoiceFrequency: {
    title: "Invoice Frequency",
    description: "How often bills will be sent to the client",
    examples: ["Monthly - standard practice", "Quarterly - for ongoing matters"],
    required: false,
    category: 'billing'
  },
  
  billingContact: {
    title: "Billing Contact",
    description: "Client contact person for billing and payment matters",
    examples: ["CFO - finance@company.com", "Accounting Dept - billing@client.com"],
    required: false,
    category: 'billing'
  },
  
  expenseTracking: {
    title: "Expense Tracking",
    description: "Whether to track and bill client for case-related expenses",
    examples: ["Yes - court fees, travel costs", "No - expenses included in fee"],
    required: false,
    category: 'billing'
  },
  
  // Important Dates
  retainerDate: {
    title: "Retainer Date",
    description: "Date when the retainer agreement was signed and matter began",
    required: false,
    category: 'legal'
  },
  
  nextActionDate: {
    title: "Next Action Date",
    description: "Next scheduled deadline or important milestone for this matter",
    examples: ["Discovery deadline", "Mediation session", "Contract signing"],
    required: false,
    category: 'basic'
  },
  
  statuteOfLimitations: {
    title: "Statute of Limitations",
    description: "Legal deadline by which action must be taken or rights are lost",
    required: false,
    category: 'legal'
  },
  
  trialDate: {
    title: "Trial Date",
    description: "Scheduled court trial or hearing date",
    required: false,
    category: 'legal'
  },
  
  // Notifications
  clientNotifications: {
    title: "Client Notifications",
    description: "Send automatic updates to client about matter progress",
    examples: ["Yes - weekly progress emails", "No - manual updates only"],
    required: false,
    category: 'notifications'
  },
  
  deadlineReminders: {
    title: "Deadline Reminders",
    description: "Automated alerts for important dates and deadlines",
    examples: ["7 days before statute deadline", "24 hours before court appearance"],
    required: false,
    category: 'notifications'
  },
  
  taskNotifications: {
    title: "Task Notifications",
    description: "Alerts when tasks are completed or require attention",
    examples: ["Document review completed", "Motion filed with court"],
    required: false,
    category: 'notifications'
  },
  
  emailNotifications: {
    title: "Email Notifications",
    description: "Send updates via email to team members and client",
    required: false,
    category: 'notifications'
  },
  
  smsNotifications: {
    title: "SMS Notifications",
    description: "Send urgent alerts via text message",
    examples: ["Court date changes", "Emergency deadlines"],
    required: false,
    category: 'notifications'
  },
  
  // Permissions and Access
  fileAccess: {
    title: "File Access Level",
    description: "What level of document access the client should have",
    examples: ["Full - all documents", "Limited - final versions only", "View Only - read access"],
    required: false,
    category: 'permissions'
  },
  
  clientPortalAccess: {
    title: "Client Portal Access",
    description: "Allow client to access online portal for matter information",
    examples: ["Yes - full portal access", "No - manual updates only"],
    required: false,
    category: 'permissions'
  },
  
  documentSharing: {
    title: "Document Sharing",
    description: "Permission for client to share documents with third parties",
    examples: ["Yes - with approval", "No - firm only", "Restricted - specific documents"],
    required: false,
    category: 'permissions'
  },
  
  // Tags and Notes
  tags: {
    title: "Matter Tags",
    description: "Keywords for easy searching and categorization",
    examples: ["merger", "urgent", "international", "pro-bono"],
    required: false,
    category: 'basic'
  },
  
  notes: {
    title: "Internal Notes",
    description: "Private notes for team use, not visible to client",
    examples: ["Client prefers email communication", "Bill monthly by 15th"],
    required: false,
    category: 'basic'
  },
  
  // Custom Fields
  industryType: {
    title: "Industry Type",
    description: "The client's primary business sector or industry",
    examples: ["Technology", "Healthcare", "Manufacturing", "Financial Services"],
    required: false,
    category: 'custom'
  },
  
  dealValue: {
    title: "Deal Value",
    description: "Total monetary value of the transaction or dispute",
    examples: ["$2.5M acquisition", "$500K settlement demand"],
    required: false,
    category: 'custom'
  },
  
  regulatoryBody: {
    title: "Regulatory Body",
    description: "Government agency or regulator involved in this matter",
    examples: ["SEC", "FDA", "EPA", "State Bar"],
    required: false,
    category: 'custom'
  },
  
  closeExpectedDate: {
    title: "Expected Close Date",
    description: "Anticipated completion date for this matter",
    required: false,
    category: 'custom'
  },

  // Additional fields
  customFieldName: {
    title: "Custom Field Name",
    description: "Name for your custom field to track specific information",
    examples: ["Deal Size", "Contract Type", "Risk Level"],
    required: false,
    category: 'custom'
  }
};

// Helper function to get help text by field name
export const getFieldHelpText = (fieldName: string): FieldHelpText | null => {
  return fieldHelpTexts[fieldName] || null;
};

// Helper function to get help texts by category
export const getFieldHelpTextsByCategory = (category: FieldHelpText['category']) => {
  return Object.entries(fieldHelpTexts)
    .filter(([_, helpText]) => helpText.category === category)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export default fieldHelpTexts;