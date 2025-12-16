import { 
  Integration, 
  IntegrationCategory, 
  IntegrationSearchFilters, 
  IntegrationConnectionRequest,
  IntegrationUsageStats,
  INTEGRATION_CATEGORIES
} from '@/types/integrations';

// Mock integration data
const MOCK_INTEGRATIONS: Integration[] = [
  // Practice Management
  {
    id: 'clio',
    name: 'Clio',
    category: 'practice_management',
    provider: 'Clio',
    description: 'Leading cloud-based legal practice management software',
    longDescription: 'Clio is the world\'s leading cloud-based legal practice management software, trusted by over 150,000 legal professionals worldwide. Manage cases, clients, documents, time tracking, and billing all in one secure platform.',
    logoUrl: 'https://via.placeholder.com/40x40/4F46E5/white?text=C',
    authType: 'oauth',
    status: 'connected',
    features: ['Case Management', 'Time Tracking', 'Client Portal', 'Document Management', 'Billing', 'Calendar'],
    setupComplexity: 'easy',
    pricing: 'paid',
    popularityRank: 1,
    isPopular: true,
    compliance: ['SOC 2', 'ISO 27001', 'ABA Model Rules'],
    website: 'https://www.clio.com',
    documentation: 'https://api.clio.com/docs',
    supportEmail: 'support@clio.com',
    requiredFields: [],
    lastSync: '2024-01-15T10:30:00Z',
    syncedRecords: 1247,
    connectedAt: '2024-01-10T14:22:00Z'
  },
  {
    id: 'mycase',
    name: 'MyCase',
    category: 'practice_management',
    provider: 'MyCase',
    description: 'All-in-one legal practice management software',
    longDescription: 'MyCase provides law firms with everything they need to manage their practice, from case management to client communication, time tracking, and billing.',
    logoUrl: '/integrations/mycase.png',
    authType: 'oauth',
    status: 'disconnected',
    features: ['Case Management', 'Client Portal', 'Time Tracking', 'Billing', 'Document Management'],
    setupComplexity: 'easy',
    pricing: 'paid',
    popularityRank: 2,
    isPopular: true,
    compliance: ['SOC 2', 'HIPAA'],
    website: 'https://www.mycase.com',
    documentation: 'https://api.mycase.com/docs',
    supportEmail: 'support@mycase.com',
    requiredFields: []
  },
  {
    id: 'practicepanther',
    name: 'PracticePanther',
    category: 'practice_management',
    provider: 'PracticePanther',
    description: 'Modern legal practice management software',
    longDescription: 'PracticePanther is a modern, user-friendly legal practice management software that helps law firms manage cases, clients, and documents efficiently.',
    logoUrl: '/integrations/practicepanther.png',
    authType: 'oauth',
    status: 'disconnected',
    features: ['Case Management', 'Time Tracking', 'Client Portal', 'Document Management', 'Billing'],
    setupComplexity: 'easy',
    pricing: 'paid',
    popularityRank: 3,
    isPopular: true,
    compliance: ['SOC 2', 'ISO 27001'],
    website: 'https://www.practicepanther.com',
    documentation: 'https://api.practicepanther.com/docs',
    supportEmail: 'support@practicepanther.com',
    requiredFields: []
  },
  {
    id: 'smokeball',
    name: 'Smokeball',
    category: 'practice_management',
    provider: 'Smokeball',
    description: 'Legal practice management with productivity features',
    longDescription: 'Smokeball combines legal practice management with productivity tools to help law firms work more efficiently and grow their business.',
    logoUrl: '/integrations/smokeball.png',
    authType: 'api_key',
    status: 'disconnected',
    features: ['Practice Management', 'Document Automation', 'Time Tracking', 'Billing', 'Email Integration'],
    setupComplexity: 'medium',
    pricing: 'paid',
    popularityRank: 4,
    isPopular: false,
    compliance: ['SOC 2', 'ABA Model Rules'],
    website: 'https://www.smokeball.com',
    documentation: 'https://api.smokeball.com/docs',
    supportEmail: 'support@smokeball.com',
    requiredFields: [
      { id: 'api_key', name: 'API Key', type: 'password', required: true, placeholder: 'Enter your Smokeball API key' }
    ]
  },
  {
    id: 'casepacer',
    name: 'CasePacer',
    category: 'practice_management',
    provider: 'CasePacer',
    description: 'Personal injury case management system',
    longDescription: 'CasePacer is specialized case management software designed for personal injury law firms, with features for case tracking, client communication, and settlement management.',
    logoUrl: '/integrations/casepacer.png',
    authType: 'oauth',
    status: 'disconnected',
    features: ['Case Management', 'Settlement Tracking', 'Client Communication', 'Document Management', 'Reporting'],
    setupComplexity: 'medium',
    pricing: 'paid',
    popularityRank: 5,
    isPopular: false,
    compliance: ['SOC 2', 'HIPAA'],
    website: 'https://www.casepacer.com',
    documentation: 'https://api.casepacer.com/docs',
    supportEmail: 'support@casepacer.com',
    requiredFields: []
  },
  {
    id: 'filevine',
    name: 'Filevine',
    category: 'practice_management',
    provider: 'Filevine',
    description: 'Legal workflow and case management platform',
    longDescription: 'Filevine is a comprehensive legal workflow and case management platform that helps law firms organize cases, collaborate with teams, and manage client relationships.',
    logoUrl: '/integrations/filevine.png',
    authType: 'oauth',
    status: 'disconnected',
    features: ['Case Management', 'Workflow Automation', 'Team Collaboration', 'Client Communication', 'Document Management'],
    setupComplexity: 'advanced',
    pricing: 'paid',
    popularityRank: 6,
    isPopular: false,
    compliance: ['SOC 2', 'ISO 27001', 'ABA Model Rules'],
    website: 'https://www.filevine.com',
    documentation: 'https://api.filevine.com/docs',
    supportEmail: 'support@filevine.com',
    requiredFields: []
  },
  {
    id: 'lawruler',
    name: 'LawRuler',
    category: 'practice_management',
    provider: 'LawRuler',
    description: 'Legal case management and marketing platform',
    longDescription: 'LawRuler provides integrated case management and marketing tools to help law firms manage cases efficiently while growing their practice.',
    logoUrl: '/integrations/lawruler.png',
    authType: 'api_key',
    status: 'disconnected',
    features: ['Case Management', 'Lead Management', 'Marketing Automation', 'Client Communication', 'Reporting'],
    setupComplexity: 'medium',
    pricing: 'paid',
    popularityRank: 7,
    isPopular: false,
    compliance: ['SOC 2'],
    website: 'https://www.lawruler.com',
    documentation: 'https://api.lawruler.com/docs',
    supportEmail: 'support@lawruler.com',
    requiredFields: [
      { id: 'api_key', name: 'API Key', type: 'password', required: true, placeholder: 'Enter your LawRuler API key' }
    ]
  },
  {
    id: 'abacuslaw',
    name: 'AbacusLaw',
    category: 'practice_management',
    provider: 'AbacusLaw',
    description: 'Comprehensive legal practice management suite',
    longDescription: 'AbacusLaw offers a complete suite of legal practice management tools including case management, time tracking, billing, and accounting features.',
    logoUrl: '/integrations/abacuslaw.png',
    authType: 'basic',
    status: 'disconnected',
    features: ['Case Management', 'Time Tracking', 'Billing', 'Accounting', 'Document Management', 'Calendar'],
    setupComplexity: 'advanced',
    pricing: 'paid',
    popularityRank: 8,
    isPopular: false,
    compliance: ['SOC 2', 'ABA Model Rules'],
    website: 'https://www.abacuslaw.com',
    documentation: 'https://api.abacuslaw.com/docs',
    supportEmail: 'support@abacuslaw.com',
    requiredFields: [
      { id: 'username', name: 'Username', type: 'text', required: true, placeholder: 'Enter your AbacusLaw username' },
      { id: 'password', name: 'Password', type: 'password', required: true, placeholder: 'Enter your AbacusLaw password' }
    ]
  },

  // Document & Storage
  {
    id: 'box',
    name: 'Box',
    category: 'document_storage',
    provider: 'Box',
    description: 'Secure cloud storage with legal compliance',
    longDescription: 'Box provides secure cloud storage and collaboration tools with enterprise-grade security and compliance features designed for legal professionals.',
    logoUrl: '/integrations/box.png',
    authType: 'oauth',
    status: 'connected',
    features: ['Cloud Storage', 'Document Collaboration', 'Version Control', 'Security Controls', 'Compliance'],
    setupComplexity: 'easy',
    pricing: 'freemium',
    popularityRank: 1,
    isPopular: true,
    compliance: ['SOC 2', 'HIPAA', 'ISO 27001', 'FedRAMP'],
    website: 'https://www.box.com',
    documentation: 'https://developer.box.com/docs',
    supportEmail: 'support@box.com',
    requiredFields: [],
    lastSync: '2024-01-15T09:45:00Z',
    syncedRecords: 3456,
    connectedAt: '2024-01-08T11:15:00Z'
  },
  {
    id: 'dropbox-business',
    name: 'Dropbox Business',
    category: 'document_storage',
    provider: 'Dropbox',
    description: 'Business-grade file sync and sharing',
    longDescription: 'Dropbox Business provides secure file sync, sharing, and collaboration tools with advanced admin controls and compliance features for legal teams.',
    logoUrl: '/integrations/dropbox.png',
    authType: 'oauth',
    status: 'disconnected',
    features: ['File Sync', 'File Sharing', 'Team Collaboration', 'Version History', 'Admin Controls'],
    setupComplexity: 'easy',
    pricing: 'paid',
    popularityRank: 2,
    isPopular: true,
    compliance: ['SOC 2', 'HIPAA', 'ISO 27001'],
    website: 'https://www.dropbox.com/business',
    documentation: 'https://www.dropbox.com/developers/documentation',
    supportEmail: 'support@dropbox.com',
    requiredFields: []
  },
  {
    id: 'onedrive',
    name: 'Microsoft OneDrive',
    category: 'document_storage',
    provider: 'Microsoft',
    description: 'Microsoft 365 cloud storage and collaboration',
    longDescription: 'OneDrive for Business provides secure cloud storage integrated with Microsoft 365, offering seamless collaboration and enterprise-grade security.',
    logoUrl: '/integrations/onedrive.png',
    authType: 'oauth',
    status: 'disconnected',
    features: ['Cloud Storage', 'Office 365 Integration', 'Real-time Collaboration', 'Version Control', 'Security'],
    setupComplexity: 'easy',
    pricing: 'paid',
    popularityRank: 3,
    isPopular: true,
    compliance: ['SOC 2', 'HIPAA', 'ISO 27001', 'FedRAMP'],
    website: 'https://www.microsoft.com/en-us/microsoft-365/onedrive',
    documentation: 'https://docs.microsoft.com/en-us/onedrive/developer/',
    supportEmail: 'support@microsoft.com',
    requiredFields: []
  },
  {
    id: 'netdocuments',
    name: 'NetDocuments',
    category: 'document_storage',
    provider: 'NetDocuments',
    description: 'Legal-specific document management system',
    longDescription: 'NetDocuments is a secure, cloud-based document management system designed specifically for legal professionals with advanced security and compliance features.',
    logoUrl: '/integrations/netdocuments.png',
    authType: 'oauth',
    status: 'disconnected',
    features: ['Document Management', 'Legal-specific Features', 'Security Controls', 'Compliance', 'Integration'],
    setupComplexity: 'medium',
    pricing: 'paid',
    popularityRank: 4,
    isPopular: false,
    compliance: ['SOC 2', 'HIPAA', 'ISO 27001', 'ABA Model Rules'],
    website: 'https://www.netdocuments.com',
    documentation: 'https://api.netdocuments.com/docs',
    supportEmail: 'support@netdocuments.com',
    requiredFields: []
  },
  {
    id: 'imanage',
    name: 'iManage',
    category: 'document_storage',
    provider: 'iManage',
    description: 'Enterprise document and email management',
    longDescription: 'iManage provides enterprise-grade document and email management solutions designed for legal and professional services organizations.',
    logoUrl: '/integrations/imanage.png',
    authType: 'oauth',
    status: 'disconnected',
    features: ['Document Management', 'Email Management', 'Enterprise Features', 'Security', 'Compliance'],
    setupComplexity: 'advanced',
    pricing: 'paid',
    popularityRank: 5,
    isPopular: false,
    compliance: ['SOC 2', 'HIPAA', 'ISO 27001', 'ABA Model Rules'],
    website: 'https://www.imanage.com',
    documentation: 'https://api.imanage.com/docs',
    supportEmail: 'support@imanage.com',
    requiredFields: []
  },
  {
    id: 'sharepoint',
    name: 'SharePoint',
    category: 'document_storage',
    provider: 'Microsoft',
    description: 'Microsoft collaboration and document platform',
    longDescription: 'SharePoint provides document management, collaboration, and intranet capabilities as part of the Microsoft 365 ecosystem.',
    logoUrl: '/integrations/sharepoint.png',
    authType: 'oauth',
    status: 'disconnected',
    features: ['Document Management', 'Team Collaboration', 'Intranet', 'Workflow', 'Integration'],
    setupComplexity: 'medium',
    pricing: 'paid',
    popularityRank: 6,
    isPopular: false,
    compliance: ['SOC 2', 'HIPAA', 'ISO 27001', 'FedRAMP'],
    website: 'https://www.microsoft.com/en-us/microsoft-365/sharepoint',
    documentation: 'https://docs.microsoft.com/en-us/sharepoint/dev/',
    supportEmail: 'support@microsoft.com',
    requiredFields: []
  },

  // Email & Communication
  {
    id: 'outlook',
    name: 'Microsoft Outlook',
    category: 'email_communication',
    provider: 'Microsoft',
    description: 'Email and calendar management',
    longDescription: 'Microsoft Outlook provides comprehensive email, calendar, and contact management with enterprise-grade security and compliance features.',
    logoUrl: '/integrations/outlook.png',
    authType: 'oauth',
    status: 'connected',
    features: ['Email Management', 'Calendar', 'Contacts', 'Tasks', 'Integration'],
    setupComplexity: 'easy',
    pricing: 'paid',
    popularityRank: 1,
    isPopular: true,
    compliance: ['SOC 2', 'HIPAA', 'ISO 27001', 'FedRAMP'],
    website: 'https://www.microsoft.com/en-us/microsoft-365/outlook',
    documentation: 'https://docs.microsoft.com/en-us/graph/api/resources/mail-api-overview',
    supportEmail: 'support@microsoft.com',
    requiredFields: [],
    lastSync: '2024-01-15T11:20:00Z',
    syncedRecords: 2134,
    connectedAt: '2024-01-05T09:30:00Z'
  },
  {
    id: 'gmail',
    name: 'Gmail',
    category: 'email_communication',
    provider: 'Google',
    description: 'Google email and workspace integration',
    longDescription: 'Gmail provides secure email services with integration to Google Workspace, offering collaboration tools and enterprise-grade security.',
    logoUrl: '/integrations/gmail.png',
    authType: 'oauth',
    status: 'disconnected',
    features: ['Email Management', 'Google Workspace', 'Collaboration', 'Security', 'Integration'],
    setupComplexity: 'easy',
    pricing: 'freemium',
    popularityRank: 2,
    isPopular: true,
    compliance: ['SOC 2', 'HIPAA', 'ISO 27001'],
    website: 'https://www.gmail.com',
    documentation: 'https://developers.google.com/gmail/api',
    supportEmail: 'support@google.com',
    requiredFields: []
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'email_communication',
    provider: 'Slack',
    description: 'Team communication and collaboration',
    longDescription: 'Slack provides team messaging, file sharing, and collaboration tools with enterprise-grade security and compliance features.',
    logoUrl: '/integrations/slack.png',
    authType: 'oauth',
    status: 'disconnected',
    features: ['Team Messaging', 'File Sharing', 'Collaboration', 'Integration', 'Security'],
    setupComplexity: 'easy',
    pricing: 'freemium',
    popularityRank: 3,
    isPopular: true,
    compliance: ['SOC 2', 'HIPAA', 'ISO 27001'],
    website: 'https://slack.com',
    documentation: 'https://api.slack.com/',
    supportEmail: 'support@slack.com',
    requiredFields: []
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    category: 'email_communication',
    provider: 'Microsoft',
    description: 'Video conferencing and team collaboration',
    longDescription: 'Microsoft Teams provides video conferencing, team collaboration, and communication tools integrated with Microsoft 365.',
    logoUrl: '/integrations/teams.png',
    authType: 'oauth',
    status: 'disconnected',
    features: ['Video Conferencing', 'Team Collaboration', 'File Sharing', 'Integration', 'Security'],
    setupComplexity: 'easy',
    pricing: 'freemium',
    popularityRank: 4,
    isPopular: true,
    compliance: ['SOC 2', 'HIPAA', 'ISO 27001', 'FedRAMP'],
    website: 'https://www.microsoft.com/en-us/microsoft-teams',
    documentation: 'https://docs.microsoft.com/en-us/microsoftteams/platform/',
    supportEmail: 'support@microsoft.com',
    requiredFields: []
  },
  {
    id: 'zoom',
    name: 'Zoom',
    category: 'email_communication',
    provider: 'Zoom',
    description: 'Video conferencing and webinar platform',
    longDescription: 'Zoom provides video conferencing, webinar, and communication solutions with enterprise-grade security and compliance features.',
    logoUrl: '/integrations/zoom.png',
    authType: 'oauth',
    status: 'disconnected',
    features: ['Video Conferencing', 'Webinars', 'Screen Sharing', 'Recording', 'Security'],
    setupComplexity: 'easy',
    pricing: 'freemium',
    popularityRank: 5,
    isPopular: false,
    compliance: ['SOC 2', 'HIPAA', 'ISO 27001', 'FedRAMP'],
    website: 'https://zoom.us',
    documentation: 'https://marketplace.zoom.us/docs/api-reference/zoom-api',
    supportEmail: 'support@zoom.us',
    requiredFields: []
  },
  {
    id: 'ringcentral',
    name: 'RingCentral',
    category: 'email_communication',
    provider: 'RingCentral',
    description: 'Business phone and communication system',
    longDescription: 'RingCentral provides unified communications including phone, video, messaging, and collaboration tools for businesses.',
    logoUrl: '/integrations/ringcentral.png',
    authType: 'oauth',
    status: 'disconnected',
    features: ['Business Phone', 'Video Conferencing', 'Messaging', 'Collaboration', 'Integration'],
    setupComplexity: 'medium',
    pricing: 'paid',
    popularityRank: 6,
    isPopular: false,
    compliance: ['SOC 2', 'HIPAA', 'ISO 27001'],
    website: 'https://www.ringcentral.com',
    documentation: 'https://developers.ringcentral.com/api-reference',
    supportEmail: 'support@ringcentral.com',
    requiredFields: []
  },

  // Billing & Accounting
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    category: 'billing_accounting',
    provider: 'Intuit',
    description: 'Small business accounting software',
    longDescription: 'QuickBooks provides comprehensive accounting software for small businesses with features for invoicing, expense tracking, and financial reporting.',
    logoUrl: '/integrations/quickbooks.png',
    authType: 'oauth',
    status: 'connected',
    features: ['Accounting', 'Invoicing', 'Expense Tracking', 'Financial Reporting', 'Integration'],
    setupComplexity: 'easy',
    pricing: 'paid',
    popularityRank: 1,
    isPopular: true,
    compliance: ['SOC 2', 'PCI DSS'],
    website: 'https://quickbooks.intuit.com',
    documentation: 'https://developer.intuit.com/app/developer/qbo/docs/get-started',
    supportEmail: 'support@intuit.com',
    requiredFields: [],
    lastSync: '2024-01-15T08:30:00Z',
    syncedRecords: 892,
    connectedAt: '2024-01-12T16:45:00Z'
  },
  {
    id: 'xero',
    name: 'Xero',
    category: 'billing_accounting',
    provider: 'Xero',
    description: 'Cloud-based accounting software',
    longDescription: 'Xero provides cloud-based accounting software with features for invoicing, bank reconciliation, and financial reporting.',
    logoUrl: '/integrations/xero.png',
    authType: 'oauth',
    status: 'disconnected',
    features: ['Cloud Accounting', 'Invoicing', 'Bank Reconciliation', 'Financial Reporting', 'Integration'],
    setupComplexity: 'easy',
    pricing: 'paid',
    popularityRank: 2,
    isPopular: true,
    compliance: ['SOC 2', 'ISO 27001'],
    website: 'https://www.xero.com',
    documentation: 'https://developer.xero.com/documentation/',
    supportEmail: 'support@xero.com',
    requiredFields: []
  },
  {
    id: 'lawpay',
    name: 'LawPay',
    category: 'billing_accounting',
    provider: 'LawPay',
    description: 'Legal payment processing platform',
    longDescription: 'LawPay provides secure payment processing designed specifically for legal professionals with compliance features and trust account management.',
    logoUrl: '/integrations/lawpay.png',
    authType: 'api_key',
    status: 'disconnected',
    features: ['Payment Processing', 'Trust Account Management', 'Legal Compliance', 'Integration', 'Reporting'],
    setupComplexity: 'medium',
    pricing: 'paid',
    popularityRank: 3,
    isPopular: true,
    compliance: ['PCI DSS', 'ABA Model Rules', 'SOC 2'],
    website: 'https://www.lawpay.com',
    documentation: 'https://api.lawpay.com/docs',
    supportEmail: 'support@lawpay.com',
    requiredFields: [
      { id: 'api_key', name: 'API Key', type: 'password', required: true, placeholder: 'Enter your LawPay API key' }
    ]
  },
  {
    id: 'timesolv',
    name: 'TimeSolv',
    category: 'billing_accounting',
    provider: 'TimeSolv',
    description: 'Time tracking and billing software',
    longDescription: 'TimeSolv provides time tracking and billing software designed for legal professionals with features for project management and invoicing.',
    logoUrl: '/integrations/timesolv.png',
    authType: 'oauth',
    status: 'disconnected',
    features: ['Time Tracking', 'Billing', 'Project Management', 'Invoicing', 'Reporting'],
    setupComplexity: 'easy',
    pricing: 'paid',
    popularityRank: 4,
    isPopular: false,
    compliance: ['SOC 2', 'ABA Model Rules'],
    website: 'https://www.timesolv.com',
    documentation: 'https://api.timesolv.com/docs',
    supportEmail: 'support@timesolv.com',
    requiredFields: []
  },
  {
    id: 'bill4time',
    name: 'Bill4Time',
    category: 'billing_accounting',
    provider: 'Bill4Time',
    description: 'Time tracking and billing solution',
    longDescription: 'Bill4Time provides time tracking and billing solutions with features for project management, invoicing, and financial reporting.',
    logoUrl: '/integrations/bill4time.png',
    authType: 'oauth',
    status: 'disconnected',
    features: ['Time Tracking', 'Billing', 'Project Management', 'Invoicing', 'Financial Reporting'],
    setupComplexity: 'easy',
    pricing: 'paid',
    popularityRank: 5,
    isPopular: false,
    compliance: ['SOC 2'],
    website: 'https://www.bill4time.com',
    documentation: 'https://api.bill4time.com/docs',
    supportEmail: 'support@bill4time.com',
    requiredFields: []
  },
  {
    id: 'prolaw',
    name: 'ProLaw',
    category: 'billing_accounting',
    provider: 'Thomson Reuters',
    description: 'Legal billing and accounting software',
    longDescription: 'ProLaw provides comprehensive legal billing and accounting software with features for time tracking, billing, and financial management.',
    logoUrl: '/integrations/prolaw.png',
    authType: 'basic',
    status: 'disconnected',
    features: ['Legal Billing', 'Accounting', 'Time Tracking', 'Financial Management', 'Reporting'],
    setupComplexity: 'advanced',
    pricing: 'paid',
    popularityRank: 6,
    isPopular: false,
    compliance: ['SOC 2', 'ABA Model Rules'],
    website: 'https://legal.thomsonreuters.com/en/products/prolaw',
    documentation: 'https://api.prolaw.com/docs',
    supportEmail: 'support@thomsonreuters.com',
    requiredFields: [
      { id: 'username', name: 'Username', type: 'text', required: true, placeholder: 'Enter your ProLaw username' },
      { id: 'password', name: 'Password', type: 'password', required: true, placeholder: 'Enter your ProLaw password' }
    ]
  },

  // Legal Research
  {
    id: 'westlaw',
    name: 'Westlaw',
    category: 'legal_research',
    provider: 'Thomson Reuters',
    description: 'Premier legal research platform',
    longDescription: 'Westlaw provides comprehensive legal research with access to case law, statutes, regulations, and legal analysis tools.',
    logoUrl: '/integrations/westlaw.png',
    authType: 'oauth',
    status: 'disconnected',
    features: ['Legal Research', 'Case Law', 'Statutes', 'Regulations', 'Legal Analysis'],
    setupComplexity: 'medium',
    pricing: 'paid',
    popularityRank: 1,
    isPopular: true,
    compliance: ['SOC 2', 'ISO 27001'],
    website: 'https://legal.thomsonreuters.com/en/products/westlaw',
    documentation: 'https://api.westlaw.com/docs',
    supportEmail: 'support@thomsonreuters.com',
    requiredFields: []
  },
  {
    id: 'lexisnexis',
    name: 'LexisNexis',
    category: 'legal_research',
    provider: 'LexisNexis',
    description: 'Legal research and analytics platform',
    longDescription: 'LexisNexis provides legal research, analytics, and business intelligence tools for legal professionals.',
    logoUrl: '/integrations/lexisnexis.png',
    authType: 'oauth',
    status: 'disconnected',
    features: ['Legal Research', 'Analytics', 'Business Intelligence', 'Case Law', 'Legal News'],
    setupComplexity: 'medium',
    pricing: 'paid',
    popularityRank: 2,
    isPopular: true,
    compliance: ['SOC 2', 'ISO 27001'],
    website: 'https://www.lexisnexis.com',
    documentation: 'https://api.lexisnexis.com/docs',
    supportEmail: 'support@lexisnexis.com',
    requiredFields: []
  },
  {
    id: 'bloomberg-law',
    name: 'Bloomberg Law',
    category: 'legal_research',
    provider: 'Bloomberg',
    description: 'Legal research and business intelligence',
    longDescription: 'Bloomberg Law provides legal research, news, and business intelligence tools for legal professionals.',
    logoUrl: '/integrations/bloomberg-law.png',
    authType: 'oauth',
    status: 'disconnected',
    features: ['Legal Research', 'Legal News', 'Business Intelligence', 'Analytics', 'Practice Tools'],
    setupComplexity: 'medium',
    pricing: 'paid',
    popularityRank: 3,
    isPopular: false,
    compliance: ['SOC 2', 'ISO 27001'],
    website: 'https://www.bloomberglaw.com',
    documentation: 'https://api.bloomberglaw.com/docs',
    supportEmail: 'support@bloomberglaw.com',
    requiredFields: []
  },
  {
    id: 'fastcase',
    name: 'Fastcase',
    category: 'legal_research',
    provider: 'Fastcase',
    description: 'Legal research database and analytics',
    longDescription: 'Fastcase provides legal research database with case law, statutes, and analytics tools for legal professionals.',
    logoUrl: '/integrations/fastcase.png',
    authType: 'oauth',
    status: 'disconnected',
    features: ['Legal Research', 'Case Law', 'Statutes', 'Analytics', 'Legal News'],
    setupComplexity: 'easy',
    pricing: 'freemium',
    popularityRank: 4,
    isPopular: false,
    compliance: ['SOC 2'],
    website: 'https://www.fastcase.com',
    documentation: 'https://api.fastcase.com/docs',
    supportEmail: 'support@fastcase.com',
    requiredFields: []
  },
  {
    id: 'courtlistener',
    name: 'CourtListener',
    category: 'legal_research',
    provider: 'Free Law Project',
    description: 'Free legal search engine and database',
    longDescription: 'CourtListener provides free access to legal documents, court filings, and legal research tools.',
    logoUrl: '/integrations/courtlistener.png',
    authType: 'api_key',
    status: 'disconnected',
    features: ['Legal Research', 'Court Filings', 'Legal Documents', 'Search Engine', 'Free Access'],
    setupComplexity: 'easy',
    pricing: 'free',
    popularityRank: 5,
    isPopular: false,
    compliance: [],
    website: 'https://www.courtlistener.com',
    documentation: 'https://www.courtlistener.com/api/',
    supportEmail: 'support@courtlistener.com',
    requiredFields: [
      { id: 'api_key', name: 'API Key', type: 'password', required: true, placeholder: 'Enter your CourtListener API key' }
    ]
  },

  // E-Discovery & Litigation
  {
    id: 'relativity',
    name: 'Relativity',
    category: 'ediscovery_litigation',
    provider: 'Relativity',
    description: 'E-discovery and litigation support platform',
    longDescription: 'Relativity provides comprehensive e-discovery and litigation support with advanced analytics and review capabilities.',
    logoUrl: '/integrations/relativity.png',
    authType: 'oauth',
    status: 'disconnected',
    features: ['E-Discovery', 'Litigation Support', 'Document Review', 'Analytics', 'Case Management'],
    setupComplexity: 'advanced',
    pricing: 'paid',
    popularityRank: 1,
    isPopular: true,
    compliance: ['SOC 2', 'ISO 27001', 'FedRAMP'],
    website: 'https://www.relativity.com',
    documentation: 'https://api.relativity.com/docs',
    supportEmail: 'support@relativity.com',
    requiredFields: []
  },
  {
    id: 'exterro',
    name: 'Exterro',
    category: 'ediscovery_litigation',
    provider: 'Exterro',
    description: 'Legal GRC and e-discovery software',
    longDescription: 'Exterro provides legal governance, risk, and compliance (GRC) software with e-discovery and litigation support capabilities.',
    logoUrl: '/integrations/exterro.png',
    authType: 'oauth',
    status: 'disconnected',
    features: ['Legal GRC', 'E-Discovery', 'Litigation Support', 'Compliance', 'Risk Management'],
    setupComplexity: 'advanced',
    pricing: 'paid',
    popularityRank: 2,
    isPopular: false,
    compliance: ['SOC 2', 'ISO 27001'],
    website: 'https://www.exterro.com',
    documentation: 'https://api.exterro.com/docs',
    supportEmail: 'support@exterro.com',
    requiredFields: []
  },
  {
    id: 'logikcull',
    name: 'Logikcull',
    category: 'ediscovery_litigation',
    provider: 'Logikcull',
    description: 'E-discovery for legal teams',
    longDescription: 'Logikcull provides simple and powerful e-discovery software designed for legal teams and corporate legal departments.',
    logoUrl: '/integrations/logikcull.png',
    authType: 'oauth',
    status: 'disconnected',
    features: ['E-Discovery', 'Document Review', 'Data Processing', 'Analytics', 'Collaboration'],
    setupComplexity: 'medium',
    pricing: 'paid',
    popularityRank: 3,
    isPopular: false,
    compliance: ['SOC 2', 'ISO 27001'],
    website: 'https://www.logikcull.com',
    documentation: 'https://api.logikcull.com/docs',
    supportEmail: 'support@logikcull.com',
    requiredFields: []
  },
  {
    id: 'disco',
    name: 'Disco',
    category: 'ediscovery_litigation',
    provider: 'CS Disco',
    description: 'Legal technology platform for e-discovery',
    longDescription: 'CS Disco provides AI-powered legal technology solutions for e-discovery, document review, and case management.',
    logoUrl: '/integrations/disco.png',
    authType: 'oauth',
    status: 'disconnected',
    features: ['E-Discovery', 'AI-Powered Review', 'Document Management', 'Analytics', 'Case Management'],
    setupComplexity: 'medium',
    pricing: 'paid',
    popularityRank: 4,
    isPopular: false,
    compliance: ['SOC 2', 'ISO 27001'],
    website: 'https://www.csdisco.com',
    documentation: 'https://api.csdisco.com/docs',
    supportEmail: 'support@csdisco.com',
    requiredFields: []
  },
  {
    id: 'onna',
    name: 'Onna',
    category: 'ediscovery_litigation',
    provider: 'Onna',
    description: 'Knowledge integration platform',
    longDescription: 'Onna provides a knowledge integration platform that connects and organizes data from multiple sources for legal and compliance teams.',
    logoUrl: '/integrations/onna.png',
    authType: 'oauth',
    status: 'disconnected',
    features: ['Knowledge Integration', 'Data Connection', 'Compliance', 'Legal Hold', 'Analytics'],
    setupComplexity: 'advanced',
    pricing: 'paid',
    popularityRank: 5,
    isPopular: false,
    compliance: ['SOC 2', 'ISO 27001'],
    website: 'https://www.onna.com',
    documentation: 'https://api.onna.com/docs',
    supportEmail: 'support@onna.com',
    requiredFields: []
  },

  // Client Intake & CRM
  {
    id: 'salesforce',
    name: 'Salesforce',
    category: 'client_intake_crm',
    provider: 'Salesforce',
    description: 'Customer relationship management platform',
    longDescription: 'Salesforce provides comprehensive customer relationship management with sales, marketing, and service capabilities.',
    logoUrl: '/integrations/salesforce.png',
    authType: 'oauth',
    status: 'disconnected',
    features: ['CRM', 'Sales Management', 'Marketing Automation', 'Service Management', 'Analytics'],
    setupComplexity: 'medium',
    pricing: 'paid',
    popularityRank: 1,
    isPopular: true,
    compliance: ['SOC 2', 'ISO 27001', 'HIPAA'],
    website: 'https://www.salesforce.com',
    documentation: 'https://developer.salesforce.com/docs/atlas.en-us.api.meta/api/',
    supportEmail: 'support@salesforce.com',
    requiredFields: []
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'client_intake_crm',
    provider: 'HubSpot',
    description: 'Inbound marketing and CRM platform',
    longDescription: 'HubSpot provides inbound marketing, sales, and customer service tools with CRM capabilities.',
    logoUrl: '/integrations/hubspot.png',
    authType: 'oauth',
    status: 'disconnected',
    features: ['CRM', 'Marketing Automation', 'Sales Tools', 'Customer Service', 'Analytics'],
    setupComplexity: 'easy',
    pricing: 'freemium',
    popularityRank: 2,
    isPopular: true,
    compliance: ['SOC 2', 'ISO 27001', 'GDPR'],
    website: 'https://www.hubspot.com',
    documentation: 'https://developers.hubspot.com/docs/api/overview',
    supportEmail: 'support@hubspot.com',
    requiredFields: []
  },
  {
    id: 'leadfeeder',
    name: 'Leadfeeder',
    category: 'client_intake_crm',
    provider: 'Leadfeeder',
    description: 'Website visitor identification and lead generation',
    longDescription: 'Leadfeeder identifies website visitors and provides lead generation capabilities for sales and marketing teams.',
    logoUrl: '/integrations/leadfeeder.png',
    authType: 'api_key',
    status: 'disconnected',
    features: ['Lead Generation', 'Website Visitor Identification', 'Sales Intelligence', 'Integration', 'Analytics'],
    setupComplexity: 'easy',
    pricing: 'freemium',
    popularityRank: 3,
    isPopular: false,
    compliance: ['GDPR'],
    website: 'https://www.leadfeeder.com',
    documentation: 'https://api.leadfeeder.com/docs',
    supportEmail: 'support@leadfeeder.com',
    requiredFields: [
      { id: 'api_key', name: 'API Key', type: 'password', required: true, placeholder: 'Enter your Leadfeeder API key' }
    ]
  },
  {
    id: 'callrail',
    name: 'CallRail',
    category: 'client_intake_crm',
    provider: 'CallRail',
    description: 'Call tracking and analytics platform',
    longDescription: 'CallRail provides call tracking, analytics, and lead management tools for businesses to track marketing performance.',
    logoUrl: '/integrations/callrail.png',
    authType: 'api_key',
    status: 'disconnected',
    features: ['Call Tracking', 'Analytics', 'Lead Management', 'Marketing Attribution', 'Reporting'],
    setupComplexity: 'easy',
    pricing: 'paid',
    popularityRank: 4,
    isPopular: false,
    compliance: ['SOC 2'],
    website: 'https://www.callrail.com',
    documentation: 'https://apidocs.callrail.com/',
    supportEmail: 'support@callrail.com',
    requiredFields: [
      { id: 'api_key', name: 'API Key', type: 'password', required: true, placeholder: 'Enter your CallRail API key' }
    ]
  },
  {
    id: 'lawmatics',
    name: 'Lawmatics',
    category: 'client_intake_crm',
    provider: 'Lawmatics',
    description: 'Legal CRM and marketing automation',
    longDescription: 'Lawmatics provides CRM and marketing automation specifically designed for law firms with client intake and lead management features.',
    logoUrl: '/integrations/lawmatics.png',
    authType: 'oauth',
    status: 'disconnected',
    features: ['Legal CRM', 'Marketing Automation', 'Client Intake', 'Lead Management', 'Analytics'],
    setupComplexity: 'medium',
    pricing: 'paid',
    popularityRank: 5,
    isPopular: false,
    compliance: ['SOC 2', 'ABA Model Rules'],
    website: 'https://www.lawmatics.com',
    documentation: 'https://api.lawmatics.com/docs',
    supportEmail: 'support@lawmatics.com',
    requiredFields: []
  },

  // Compliance & Security
  {
    id: 'microsoft-purview',
    name: 'Microsoft Purview',
    category: 'compliance_security',
    provider: 'Microsoft',
    description: 'Information protection and governance',
    longDescription: 'Microsoft Purview provides comprehensive information protection, governance, and compliance solutions for organizations.',
    logoUrl: '/integrations/microsoft-purview.png',
    authType: 'oauth',
    status: 'disconnected',
    features: ['Information Protection', 'Data Governance', 'Compliance', 'Risk Management', 'Analytics'],
    setupComplexity: 'advanced',
    pricing: 'paid',
    popularityRank: 1,
    isPopular: true,
    compliance: ['SOC 2', 'ISO 27001', 'FedRAMP', 'HIPAA'],
    website: 'https://www.microsoft.com/en-us/security/business/microsoft-purview',
    documentation: 'https://docs.microsoft.com/en-us/purview/',
    supportEmail: 'support@microsoft.com',
    requiredFields: []
  },
  {
    id: 'varonis',
    name: 'Varonis',
    category: 'compliance_security',
    provider: 'Varonis',
    description: 'Data security and analytics platform',
    longDescription: 'Varonis provides data security and analytics solutions to protect sensitive data and ensure compliance.',
    logoUrl: '/integrations/varonis.png',
    authType: 'oauth',
    status: 'disconnected',
    features: ['Data Security', 'Analytics', 'Compliance', 'Threat Detection', 'Risk Management'],
    setupComplexity: 'advanced',
    pricing: 'paid',
    popularityRank: 2,
    isPopular: false,
    compliance: ['SOC 2', 'ISO 27001'],
    website: 'https://www.varonis.com',
    documentation: 'https://api.varonis.com/docs',
    supportEmail: 'support@varonis.com',
    requiredFields: []
  },
  {
    id: 'egnyte',
    name: 'Egnyte',
    category: 'compliance_security',
    provider: 'Egnyte',
    description: 'Content governance and security platform',
    longDescription: 'Egnyte provides content governance, security, and compliance solutions for enterprise content management.',
    logoUrl: '/integrations/egnyte.png',
    authType: 'oauth',
    status: 'disconnected',
    features: ['Content Governance', 'Security', 'Compliance', 'File Management', 'Analytics'],
    setupComplexity: 'medium',
    pricing: 'paid',
    popularityRank: 3,
    isPopular: false,
    compliance: ['SOC 2', 'ISO 27001', 'HIPAA'],
    website: 'https://www.egnyte.com',
    documentation: 'https://developers.egnyte.com/docs',
    supportEmail: 'support@egnyte.com',
    requiredFields: []
  },
  {
    id: 'box-shield',
    name: 'Box Shield',
    category: 'compliance_security',
    provider: 'Box',
    description: 'Advanced security features for Box',
    longDescription: 'Box Shield provides advanced security features including threat detection, malware protection, and data classification for Box environments.',
    logoUrl: '/integrations/box-shield.png',
    authType: 'oauth',
    status: 'disconnected',
    features: ['Threat Detection', 'Malware Protection', 'Data Classification', 'Security Analytics', 'Compliance'],
    setupComplexity: 'advanced',
    pricing: 'paid',
    popularityRank: 4,
    isPopular: false,
    compliance: ['SOC 2', 'ISO 27001', 'FedRAMP', 'HIPAA'],
    website: 'https://www.box.com/shield',
    documentation: 'https://developer.box.com/guides/shield/',
    supportEmail: 'support@box.com',
    requiredFields: []
  },
  {
    id: 'proofpoint',
    name: 'Proofpoint',
    category: 'compliance_security',
    provider: 'Proofpoint',
    description: 'Cybersecurity and compliance solutions',
    longDescription: 'Proofpoint provides comprehensive cybersecurity and compliance solutions to protect against threats and ensure regulatory compliance.',
    logoUrl: '/integrations/proofpoint.png',
    authType: 'oauth',
    status: 'disconnected',
    features: ['Cybersecurity', 'Threat Protection', 'Compliance', 'Email Security', 'Analytics'],
    setupComplexity: 'advanced',
    pricing: 'paid',
    popularityRank: 5,
    isPopular: false,
    compliance: ['SOC 2', 'ISO 27001', 'FedRAMP'],
    website: 'https://www.proofpoint.com',
    documentation: 'https://api.proofpoint.com/docs',
    supportEmail: 'support@proofpoint.com',
    requiredFields: []
  }
];

class IntegrationsService {
  private integrations: Integration[] = [...MOCK_INTEGRATIONS];
  private connectedIntegrations: Set<string> = new Set(['clio', 'box', 'outlook', 'quickbooks']);

  // Get all available integrations
  getAvailableIntegrations(): Integration[] {
    return this.integrations.map(integration => ({
      ...integration,
      status: this.connectedIntegrations.has(integration.id) ? 'connected' : 'disconnected'
    }));
  }

  // Get integrations by category
  getIntegrationsByCategory(category: IntegrationCategory): Integration[] {
    return this.getAvailableIntegrations().filter(integration => integration.category === category);
  }

  // Get connected integrations
  getConnectedIntegrations(): Integration[] {
    return this.getAvailableIntegrations().filter(integration => integration.status === 'connected');
  }

  // Get integration by ID
  getIntegrationById(id: string): Integration | undefined {
    return this.getAvailableIntegrations().find(integration => integration.id === id);
  }

  // Search integrations
  searchIntegrations(filters: IntegrationSearchFilters): Integration[] {
    let results = this.getAvailableIntegrations();

    if (filters.category) {
      results = results.filter(integration => integration.category === filters.category);
    }

    if (filters.authType) {
      results = results.filter(integration => integration.authType === filters.authType);
    }

    if (filters.pricing) {
      results = results.filter(integration => integration.pricing === filters.pricing);
    }

    if (filters.setupComplexity) {
      results = results.filter(integration => integration.setupComplexity === filters.setupComplexity);
    }

    if (filters.status) {
      results = results.filter(integration => integration.status === filters.status);
    }

    if (filters.compliance && filters.compliance.length > 0) {
      results = results.filter(integration => 
        filters.compliance!.some(compliance => integration.compliance.includes(compliance))
      );
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      results = results.filter(integration =>
        integration.name.toLowerCase().includes(searchTerm) ||
        integration.description.toLowerCase().includes(searchTerm) ||
        integration.provider.toLowerCase().includes(searchTerm) ||
        integration.features.some(feature => feature.toLowerCase().includes(searchTerm))
      );
    }

    return results;
  }

  // Mock connect integration
  async connectIntegration(request: IntegrationConnectionRequest): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const integration = this.integrations.find(i => i.id === request.integrationId);
        if (!integration) {
          reject(new Error('Integration not found'));
          return;
        }

        // Simulate occasional connection failures
        if (Math.random() < 0.1) {
          reject(new Error('Connection failed: Invalid credentials'));
          return;
        }

        this.connectedIntegrations.add(request.integrationId);
        
        // Update integration data
        integration.status = 'connected';
        integration.connectedAt = new Date().toISOString();
        integration.lastSync = new Date().toISOString();
        integration.syncedRecords = Math.floor(Math.random() * 5000) + 100;
        integration.config = request.config;

        resolve();
      }, 1500); // Simulate API delay
    });
  }

  // Mock disconnect integration
  async disconnectIntegration(integrationId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const integration = this.integrations.find(i => i.id === integrationId);
        if (!integration) {
          reject(new Error('Integration not found'));
          return;
        }

        this.connectedIntegrations.delete(integrationId);
        
        // Update integration data
        integration.status = 'disconnected';
        integration.connectedAt = undefined;
        integration.lastSync = undefined;
        integration.syncedRecords = undefined;
        integration.config = undefined;

        resolve();
      }, 1000);
    });
  }

  // Mock test connection
  async testConnection(integrationId: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate test results
        const success = Math.random() > 0.2; // 80% success rate
        resolve(success);
      }, 2000);
    });
  }

  // Get usage statistics
  getUsageStats(): IntegrationUsageStats {
    const allIntegrations = this.getAvailableIntegrations();
    const connected = this.getConnectedIntegrations();
    
    const byCategory = {} as Record<IntegrationCategory, number>;
    Object.keys(INTEGRATION_CATEGORIES).forEach(category => {
      byCategory[category as IntegrationCategory] = connected.filter(i => i.category === category).length;
    });

    return {
      totalConnected: connected.length,
      totalAvailable: allIntegrations.length,
      mostPopular: allIntegrations.filter(i => i.isPopular).slice(0, 5),
      recentlyConnected: connected.slice(-3),
      byCategory
    };
  }

  // Get popular integrations
  getPopularIntegrations(): Integration[] {
    return this.getAvailableIntegrations()
      .filter(integration => integration.isPopular)
      .sort((a, b) => a.popularityRank - b.popularityRank);
  }

  // Get recently connected integrations
  getRecentlyConnected(): Integration[] {
    return this.getConnectedIntegrations()
      .filter(integration => integration.connectedAt)
      .sort((a, b) => new Date(b.connectedAt!).getTime() - new Date(a.connectedAt!).getTime())
      .slice(0, 5);
  }
}

export const integrationsService = new IntegrationsService();
export default integrationsService;