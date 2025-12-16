/**
 * Shared Mock Data for Matter Forms
 * Ensures consistency between Add and Edit matter modals
 */

import { Matter, MatterPriority, MatterStatus, MatterStage } from '@/types/matter';

// Base matter data template for consistent mock data
export const mockMatterBase = {
  title: "Corporate Merger - TechCorp Acquisition",
  description: "Comprehensive legal review and documentation for the acquisition of TechCorp by GlobalInnovate Inc. This transaction involves due diligence, contract negotiations, regulatory compliance, and closing procedures.",
  clientName: "GlobalInnovate Inc.",
  status: "active" as MatterStatus,
  priority: "high" as MatterPriority,
  stage: "discovery" as MatterStage,
  practiceArea: "Corporate Law",
  practiceSubArea: "Mergers & Acquisitions",
  responsibleAttorney: "Sarah Johnson",
  originatingAttorney: "Michael Chen",
  estimatedBudget: 150000,
  tags: ["merger", "acquisition", "due-diligence", "corporate"],
  notes: "High-priority transaction with strict regulatory deadlines. Client requires weekly progress updates and expects completion by Q2 2024.",
  
  // Additional fields for enhanced forms
  hourlyRate: 500,
  flatFee: undefined,
  contingencyRate: undefined,
  expenseTracking: true,
  
  // Billing preferences
  billingMethod: "hourly" as const,
  invoiceFrequency: "monthly" as const,
  billingContact: "CFO - finance@globalinnovate.com",
  retainerAmount: 25000,
  
  // Notification settings
  clientNotifications: true,
  deadlineReminders: true,
  taskNotifications: true,
  emailNotifications: true,
  smsNotifications: false,
  
  // Access and permissions
  fileAccess: "full" as const,
  clientPortalAccess: true,
  documentSharing: true,
  confidentialityLevel: "high" as const,
  
  // Matter details
  statute: "Delaware General Corporation Law",
  jurisdiction: "Delaware",
  courtVenue: "Delaware Court of Chancery",
  opposingCounsel: "Wilson & Associates LLP",
  opposingParty: "RegionalTech Solutions",
  
  // Important dates
  retainerDate: "2024-01-15",
  nextActionDate: "2024-12-20",
  statuteOfLimitations: "2027-01-15",
  trialDate: undefined,
  
  // Custom fields
  industryType: "Technology",
  dealValue: "$2.5M",
  regulatoryBody: "SEC",
  closeExpectedDate: "2024-06-30"
};

// Practice area specific mock data
export const practiceAreaMockData = {
  "Corporate Law": {
    practiceSubArea: "Mergers & Acquisitions",
    statute: "Delaware General Corporation Law",
    jurisdiction: "Delaware",
    industryType: "Technology"
  },
  "Employment Law": {
    practiceSubArea: "Wrongful Termination",
    statute: "Title VII of the Civil Rights Act",
    jurisdiction: "Federal",
    industryType: "Manufacturing"
  },
  "Real Estate Law": {
    practiceSubArea: "Commercial Leasing",
    statute: "California Civil Code",
    jurisdiction: "California",
    industryType: "Retail"
  },
  "Family Law": {
    practiceSubArea: "Divorce & Custody",
    statute: "California Family Code",
    jurisdiction: "California",
    industryType: "Personal"
  },
  "Personal Injury": {
    practiceSubArea: "Motor Vehicle Accidents",
    statute: "State Tort Law",
    jurisdiction: "State",
    industryType: "Insurance"
  },
  "Estate Planning": {
    practiceSubArea: "Trust Administration",
    statute: "Probate Code",
    jurisdiction: "State",
    industryType: "Financial Services"
  }
};

// Team mock data
export const mockTeamData = {
  responsibleAttorneys: [
    { id: "1", name: "Sarah Johnson", email: "sarah.johnson@firm.com", rate: 500 },
    { id: "2", name: "Michael Chen", email: "michael.chen@firm.com", rate: 450 },
    { id: "3", name: "Emily Rodriguez", email: "emily.rodriguez@firm.com", rate: 475 },
    { id: "4", name: "David Kim", email: "david.kim@firm.com", rate: 425 }
  ],
  responsibleStaff: [
    { id: "1", name: "Jennifer Adams", role: "Paralegal", rate: 150 },
    { id: "2", name: "Robert Wilson", role: "Legal Assistant", rate: 125 },
    { id: "3", name: "Lisa Chen", role: "Senior Paralegal", rate: 175 },
    { id: "4", name: "Mark Thompson", role: "Document Specialist", rate: 100 }
  ]
};

// Billing configuration mock data
export const mockBillingData = {
  methods: ["hourly", "flat_fee", "contingency", "retainer"] as const,
  frequencies: ["weekly", "biweekly", "monthly", "quarterly"] as const,
  defaultHourlyRates: {
    partner: 600,
    senior_associate: 500,
    associate: 400,
    paralegal: 150,
    assistant: 100
  }
};

// Generate complete mock matter for editing
export const generateMockMatterForEdit = (practiceArea?: string): Matter => {
  const baseData = { ...mockMatterBase };
  
  if (practiceArea && practiceAreaMockData[practiceArea as keyof typeof practiceAreaMockData]) {
    const areaData = practiceAreaMockData[practiceArea as keyof typeof practiceAreaMockData];
    Object.assign(baseData, areaData);
  }
  
  return {
    id: "mock-matter-1",
    clientId: "1",
    responsibleAttorneyId: "1",
    responsibleStaffIds: ["1", "2"],
    dateOpened: "2024-01-15",
    lastActivity: "2024-12-13",
    billedAmount: 45000,
    timeSpent: 90.5,
    matterNumber: "GLB240001",
    notificationCount: 3,
    customFields: {
      dealValue: "$2.5M",
      industryType: "Technology",
      regulatoryBody: "SEC",
      closeExpectedDate: "2024-06-30"
    },
    notificationSettings: {
      email: true,
      sms: false,
      deadlineReminders: true,
      clientNotifications: true,
      taskNotifications: true
    },
    billingPreference: {
      method: "hourly",
      hourlyRate: 500,
      expenseTracking: true
    },
    permissions: {
      fileAccess: "full",
      clientPortalAccess: true,
      documentSharing: true,
      allowedUsers: ["1", "2"]
    },
    relatedContacts: [],
    taskLists: [],
    documentFolders: [],
    ...baseData
  } as Matter;
};

// Common dropdown options
export const commonDropdownOptions = {
  practiceAreas: [
    'Corporate Law',
    'Employment Law',
    'Family Law',
    'Real Estate Law',
    'Criminal Law',
    'Personal Injury',
    'Intellectual Property',
    'Estate Planning',
    'Tax Law',
    'Immigration Law',
    'Litigation'
  ],
  
  statuses: [
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'closed', label: 'Closed' }
  ],
  
  priorities: [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ],
  
  stages: [
    { value: 'open', label: 'Open' },
    { value: 'discovery', label: 'Discovery' },
    { value: 'mediation', label: 'Mediation' },
    { value: 'trial', label: 'Trial' },
    { value: 'settlement', label: 'Settlement' },
    { value: 'appeal', label: 'Appeal' },
    { value: 'closed', label: 'Closed' }
  ],
  
  billingMethods: [
    { value: 'hourly', label: 'Hourly Rate' },
    { value: 'flat_fee', label: 'Flat Fee' },
    { value: 'contingency', label: 'Contingency' },
    { value: 'retainer', label: 'Retainer' }
  ],
  
  invoiceFrequencies: [
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' }
  ],
  
  confidentialityLevels: [
    { value: 'standard', label: 'Standard' },
    { value: 'confidential', label: 'Confidential' },
    { value: 'high', label: 'Highly Confidential' },
    { value: 'attorney_client', label: 'Attorney-Client Privileged' }
  ],
  
  fileAccessLevels: [
    { value: 'view_only', label: 'View Only' },
    { value: 'limited', label: 'Limited Access' },
    { value: 'full', label: 'Full Access' },
    { value: 'admin', label: 'Administrative Access' }
  ]
};

export default {
  mockMatterBase,
  practiceAreaMockData,
  mockTeamData,
  mockBillingData,
  generateMockMatterForEdit,
  commonDropdownOptions
};