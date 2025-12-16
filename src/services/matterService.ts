import { Matter, NewMatterData, MatterFilters, MatterStatus, MatterPriority, MatterStage } from '@/types/matter';
import { TimeEntry, TimeEntryData } from '@/types/timeEntry';

// Mock data that matches the realistic data from Matters.tsx
const mockMatters: Matter[] = [
  {
    id: '1',
    title: 'Corporate Merger - TechFusion Acquisition',
    description: 'Legal analysis and due diligence for the acquisition of TechFusion Inc. by GlobalTech Corp.',
    clientId: '1',
    clientName: 'John Smith',
    status: 'active',
    priority: 'urgent',
    stage: 'discovery',
    practiceArea: 'Corporate Law',
    practiceSubArea: 'M&A',
    responsibleAttorney: 'Sarah Johnson',
    responsibleAttorneyId: '1',
    originatingAttorney: 'David Wilson',
    originatingAttorneyId: '4',
    responsibleStaff: ['Jennifer Adams', 'Robert Taylor'],
    responsibleStaffIds: ['1', '2'],
    dateOpened: '2024-11-15',
    lastActivity: '2024-12-05',
    billedAmount: 45000,
    estimatedBudget: 125000,
    timeSpent: 120.5,
    nextActionDate: '2024-12-10',
    tags: ['M&A', 'Due Diligence', 'Corporate', 'High Value'],
    notes: 'Complex merger requiring extensive due diligence and regulatory approval.',
    matterNumber: 'M240001',
    customFields: {
      dealValue: '$50M',
      targetCloseDate: '2025-02-15',
      regulatoryApproval: 'Required'
    },
    notificationSettings: {
      email: true,
      sms: true,
      deadlineReminders: true,
      clientNotifications: true,
      taskNotifications: true
    },
    billingPreference: {
      method: 'hourly',
      hourlyRate: 650,
      expenseTracking: true
    },
    permissions: {
      fileAccess: 'full',
      clientPortalAccess: true,
      documentSharing: true,
      allowedUsers: ['1', '2', '4']
    },
    relatedContacts: [
      {
        id: '1',
        contactId: 'c1',
        contactName: 'Michael Chen - Investment Banker',
        relationship: 'consultant',
        role: 'Financial Advisor',
        email: 'mchen@investmentbank.com',
        phone: '+1 (555) 123-4567'
      }
    ],
    taskLists: [
      {
        id: 'tl1',
        name: 'Due Diligence Tasks',
        tasks: [
          {
            id: 't1',
            title: 'Review Financial Statements',
            description: 'Analyze last 3 years of audited financials',
            dueDate: '2024-12-15',
            priority: 'high',
            assignedTo: 'Jennifer Adams',
            completed: false
          },
          {
            id: 't2',
            title: 'IP Portfolio Review',
            description: 'Comprehensive intellectual property analysis',
            dueDate: '2024-12-20',
            priority: 'medium',
            assignedTo: 'Robert Taylor',
            completed: true
          }
        ]
      }
    ],
    documentFolders: [
      {
        id: 'df1',
        name: 'Financial Documents',
        description: 'Financial statements, audits, tax returns',
        accessLevel: 'restricted'
      },
      {
        id: 'df2',
        name: 'Legal Documents',
        description: 'Contracts, corporate documents, IP filings',
        accessLevel: 'private'
      }
    ],
    notificationCount: 3
  },
  {
    id: '2',
    title: 'Employment Discrimination Case - Wilson vs. Corp',
    description: 'Workplace discrimination and wrongful termination claim.',
    clientId: '2',
    clientName: 'Emily Davis',
    status: 'active',
    priority: 'high',
    stage: 'discovery',
    practiceArea: 'Employment Law',
    practiceSubArea: 'Discrimination',
    responsibleAttorney: 'Michael Rodriguez',
    responsibleAttorneyId: '2',
    responsibleStaff: ['Lisa Chen', 'James Wilson'],
    responsibleStaffIds: ['3', '4'],
    dateOpened: '2024-10-20',
    lastActivity: '2024-12-03',
    billedAmount: 28000,
    estimatedBudget: 75000,
    timeSpent: 85.2,
    nextActionDate: '2024-12-12',
    tags: ['Employment', 'Discrimination', 'Litigation'],
    notes: 'Strong case with substantial evidence. Client very cooperative.',
    matterNumber: 'E240015',
    customFields: {
      caseType: 'Discrimination',
      jurisdiction: 'Federal Court',
      opposingCounsel: 'Smith & Associates'
    },
    notificationSettings: {
      email: true,
      sms: false,
      deadlineReminders: true,
      clientNotifications: true,
      taskNotifications: false
    },
    billingPreference: {
      method: 'contingency',
      contingencyPercentage: 33,
      expenseTracking: true
    },
    permissions: {
      fileAccess: 'limited',
      clientPortalAccess: true,
      documentSharing: false,
      allowedUsers: ['2', '3', '4']
    },
    relatedContacts: [
      {
        id: '2',
        contactId: 'c2',
        contactName: 'Dr. Patricia Moore',
        relationship: 'expert_witness',
        role: 'Workplace Psychology Expert',
        email: 'pmoore@expertpsych.com',
        phone: '+1 (555) 987-6543'
      }
    ],
    taskLists: [
      {
        id: 'tl2',
        name: 'Discovery Tasks',
        tasks: [
          {
            id: 't3',
            title: 'Document Production Review',
            description: 'Review employer document production',
            dueDate: '2024-12-18',
            priority: 'high',
            assignedTo: 'Lisa Chen',
            completed: false
          }
        ]
      }
    ],
    documentFolders: [
      {
        id: 'df3',
        name: 'Evidence',
        description: 'Emails, documents, witness statements',
        accessLevel: 'private'
      }
    ],
    notificationCount: 1
  },
  {
    id: '3',
    title: 'Real Estate Transaction - Sunset Plaza',
    description: 'Commercial real estate acquisition and financing.',
    clientId: '3',
    clientName: 'Tech Solutions Inc',
    status: 'active',
    priority: 'medium',
    stage: 'settlement',
    practiceArea: 'Real Estate Law',
    practiceSubArea: 'Commercial',
    responsibleAttorney: 'Jennifer Kim',
    responsibleAttorneyId: '3',
    responsibleStaff: ['David Park'],
    responsibleStaffIds: ['5'],
    dateOpened: '2024-09-10',
    lastActivity: '2024-12-01',
    billedAmount: 35000,
    estimatedBudget: 50000,
    timeSpent: 92.8,
    nextActionDate: '2024-12-15',
    tags: ['Real Estate', 'Commercial', 'Financing'],
    notes: 'Transaction progressing smoothly. Closing scheduled for December.',
    matterNumber: 'R240008',
    customFields: {
      propertyValue: '$2.5M',
      closingDate: '2024-12-20',
      lenderBank: 'First National'
    },
    notificationSettings: {
      email: true,
      sms: true,
      deadlineReminders: true,
      clientNotifications: false,
      taskNotifications: true
    },
    billingPreference: {
      method: 'flat_fee',
      flatFeeAmount: 50000,
      expenseTracking: false
    },
    permissions: {
      fileAccess: 'full',
      clientPortalAccess: true,
      documentSharing: true,
      allowedUsers: ['3', '5']
    },
    relatedContacts: [
      {
        id: '3',
        contactId: 'c3',
        contactName: 'Mark Thompson - Real Estate Broker',
        relationship: 'consultant',
        role: 'Commercial Broker',
        email: 'mthompson@realestate.com',
        phone: '+1 (555) 456-7890'
      }
    ],
    taskLists: [
      {
        id: 'tl3',
        name: 'Closing Tasks',
        tasks: [
          {
            id: 't4',
            title: 'Title Insurance Review',
            description: 'Review and approve title insurance policy',
            dueDate: '2024-12-16',
            priority: 'medium',
            assignedTo: 'David Park',
            completed: false
          }
        ]
      }
    ],
    documentFolders: [
      {
        id: 'df4',
        name: 'Transaction Documents',
        description: 'Purchase agreement, financing docs, inspections',
        accessLevel: 'restricted'
      }
    ],
    notificationCount: 0
  },
  {
    id: '4',
    title: 'Personal Injury - Auto Accident',
    description: 'Motor vehicle accident resulting in serious injuries.',
    clientId: '4',
    clientName: 'Robert Johnson',
    status: 'closed',
    priority: 'medium',
    stage: 'closed',
    practiceArea: 'Personal Injury',
    practiceSubArea: 'Auto Accident',
    responsibleAttorney: 'Lisa Martinez',
    responsibleAttorneyId: '4',
    responsibleStaff: ['Angela White'],
    responsibleStaffIds: ['6'],
    dateOpened: '2024-03-15',
    dateClosed: '2024-11-20',
    lastActivity: '2024-11-20',
    billedAmount: 85000,
    estimatedBudget: 0, // Contingency case
    timeSpent: 156.4,
    tags: ['Personal Injury', 'Auto Accident', 'Settlement'],
    notes: 'Successfully settled for $350,000. Client very satisfied.',
    matterNumber: 'P240003',
    customFields: {
      settlementAmount: '$350,000',
      insuranceCompany: 'State Farm',
      accidentDate: '2024-03-10'
    },
    notificationSettings: {
      email: false,
      sms: false,
      deadlineReminders: false,
      clientNotifications: false,
      taskNotifications: false
    },
    billingPreference: {
      method: 'contingency',
      contingencyPercentage: 33,
      expenseTracking: true
    },
    permissions: {
      fileAccess: 'limited',
      clientPortalAccess: false,
      documentSharing: false,
      allowedUsers: ['4', '6']
    },
    relatedContacts: [
      {
        id: '4',
        contactId: 'c4',
        contactName: 'Dr. Susan Rodriguez',
        relationship: 'expert_witness',
        role: 'Medical Expert',
        email: 'srodriguez@medexperts.com',
        phone: '+1 (555) 321-0987'
      }
    ],
    taskLists: [],
    documentFolders: [
      {
        id: 'df5',
        name: 'Medical Records',
        description: 'Hospital records, treatment notes, expert reports',
        accessLevel: 'private'
      }
    ],
    notificationCount: 0
  }
];

export class MatterService {
  private static readonly STORAGE_KEY = 'ross_ai_matters';
  private static readonly TIME_ENTRIES_STORAGE_KEY = 'ross_ai_time_entries';
  
  // Mock matters specifically for billing test data
  private static billingTestMatters: Matter[] = [
    {
      id: 'matter-001',
      title: 'Acme Corp Contract Review',
      description: 'Review and negotiation of vendor service agreements',
      clientId: 'client-001',
      clientName: 'Acme Corporation',
      status: 'active',
      priority: 'high',
      stage: 'negotiation',
      practiceArea: 'Corporate Law',
      practiceSubArea: 'Contracts',
      responsibleAttorney: 'Sarah Johnson',
      responsibleAttorneyId: '1',
      originatingAttorney: 'David Wilson',
      originatingAttorneyId: '4',
      responsibleStaff: ['Jennifer Adams'],
      responsibleStaffIds: ['1'],
      dateOpened: '2024-10-01',
      lastActivity: new Date().toISOString().split('T')[0],
      billedAmount: 2450,
      estimatedBudget: 10000,
      timeSpent: 7.0,
      nextActionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tags: ['Corporate', 'Contract', 'Active'],
      notes: 'Ongoing contract review and negotiation',
      matterNumber: 'M24001',
      customFields: {},
      notificationSettings: {
        email: true,
        sms: false,
        deadlineReminders: true,
        clientNotifications: true,
        taskNotifications: true
      },
      billingPreference: {
        method: 'hourly',
        hourlyRate: 350,
        expenseTracking: true
      },
      permissions: {
        fileAccess: 'full',
        clientPortalAccess: true,
        documentSharing: true,
        allowedUsers: ['1', '4']
      },
      relatedContacts: [],
      taskLists: [],
      documentFolders: [],
      notificationCount: 0
    },
    {
      id: 'matter-002',
      title: 'TechStart Trademark Registration',
      description: 'Trademark search, clearance, and registration for new product line',
      clientId: 'client-002',
      clientName: 'TechStart Inc',
      status: 'active',
      priority: 'medium',
      stage: 'discovery',
      practiceArea: 'Intellectual Property',
      practiceSubArea: 'Trademarks',
      responsibleAttorney: 'Michael Chen',
      responsibleAttorneyId: '2',
      originatingAttorney: 'Michael Chen',
      originatingAttorneyId: '2',
      responsibleStaff: ['Lisa Chen'],
      responsibleStaffIds: ['3'],
      dateOpened: '2024-09-15',
      lastActivity: new Date().toISOString().split('T')[0],
      billedAmount: 2762.50,
      estimatedBudget: 8000,
      timeSpent: 6.5,
      nextActionDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tags: ['IP', 'Trademark', 'Active'],
      notes: 'Trademark application in progress',
      matterNumber: 'M24002',
      customFields: {
        trademarkClass: 'Class 9',
        applicationNumber: 'Pending'
      },
      notificationSettings: {
        email: true,
        sms: false,
        deadlineReminders: true,
        clientNotifications: true,
        taskNotifications: true
      },
      billingPreference: {
        method: 'hourly',
        hourlyRate: 425,
        expenseTracking: true
      },
      permissions: {
        fileAccess: 'full',
        clientPortalAccess: true,
        documentSharing: true,
        allowedUsers: ['2', '3']
      },
      relatedContacts: [],
      taskLists: [],
      documentFolders: [],
      notificationCount: 0
    },
    {
      id: 'matter-003',
      title: 'Green Energy M&A Due Diligence',
      description: 'Comprehensive due diligence for acquisition of solar technology company',
      clientId: 'client-003',
      clientName: 'Green Energy Solutions',
      status: 'active',
      priority: 'urgent',
      stage: 'due_diligence',
      practiceArea: 'Corporate Law',
      practiceSubArea: 'M&A',
      responsibleAttorney: 'Sarah Johnson',
      responsibleAttorneyId: '1',
      originatingAttorney: 'David Wilson',
      originatingAttorneyId: '4',
      responsibleStaff: ['Jennifer Adams', 'Robert Taylor'],
      responsibleStaffIds: ['1', '2'],
      dateOpened: '2024-08-01',
      lastActivity: new Date().toISOString().split('T')[0],
      billedAmount: 4987.50,
      estimatedBudget: 50000,
      timeSpent: 10.5,
      nextActionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tags: ['M&A', 'Due Diligence', 'Urgent'],
      notes: 'Critical due diligence phase - environmental compliance review needed',
      matterNumber: 'M24003',
      customFields: {
        dealValue: '$25M',
        targetCloseDate: '2025-01-15',
        regulatoryApproval: 'EPA Review Required'
      },
      notificationSettings: {
        email: true,
        sms: true,
        deadlineReminders: true,
        clientNotifications: true,
        taskNotifications: true
      },
      billingPreference: {
        method: 'hourly',
        hourlyRate: 475,
        expenseTracking: true
      },
      permissions: {
        fileAccess: 'full',
        clientPortalAccess: false,
        documentSharing: false,
        allowedUsers: ['1', '2', '4']
      },
      relatedContacts: [],
      taskLists: [],
      documentFolders: [],
      notificationCount: 2
    }
  ];
  
  /**
   * Load matters from localStorage with fallback to mock data
   */
  private static loadMatters(): Matter[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : mockMatters;
    } catch (error) {
      console.error('Error loading matters from localStorage:', error);
      return mockMatters;
    }
  }

  /**
   * Save matters to localStorage
   */
  private static saveMatters(matters: Matter[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(matters));
    } catch (error) {
      console.error('Error saving matters to localStorage:', error);
    }
  }

  /**
   * Generate a new matter number
   */
  private static generateMatterNumber(): string {
    const year = new Date().getFullYear().toString().slice(-2);
    const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `M${year}${randomNum}`;
  }

  /**
   * Generate unique ID
   */
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Get all matters with optional filtering
   */
  static async getMatters(filters?: MatterFilters): Promise<Matter[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let matters = this.loadMatters();

    if (filters) {
      matters = matters.filter(matter => {
        if (filters.status && filters.status.length > 0 && !filters.status.includes(matter.status)) {
          return false;
        }
        if (filters.priority && filters.priority.length > 0 && !filters.priority.includes(matter.priority)) {
          return false;
        }
        if (filters.practiceArea && filters.practiceArea.length > 0 && !filters.practiceArea.includes(matter.practiceArea)) {
          return false;
        }
        if (filters.responsibleAttorney && filters.responsibleAttorney.length > 0 && !filters.responsibleAttorney.includes(matter.responsibleAttorneyId)) {
          return false;
        }
        if (filters.clientId && matter.clientId !== filters.clientId) {
          return false;
        }
        if (filters.dateRange) {
          const matterDate = new Date(matter.dateOpened);
          const startDate = new Date(filters.dateRange.start);
          const endDate = new Date(filters.dateRange.end);
          if (matterDate < startDate || matterDate > endDate) {
            return false;
          }
        }
        return true;
      });
    }

    return matters;
  }

  /**
   * Get matters by client ID
   */
  static async getMattersByClient(clientId: string): Promise<Matter[]> {
    const allMatters = await this.getMatters();
    return allMatters.filter(matter => matter.clientId === clientId);
  }

  /**
   * Get a specific matter by ID
   */
  static async getMatter(id: string): Promise<Matter | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const matters = this.loadMatters();
    return matters.find(matter => matter.id === id) || null;
  }

  /**
   * Create a new matter
   */
  static async createMatter(matterData: NewMatterData): Promise<Matter> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const matters = this.loadMatters();
    
    const newMatter: Matter = {
      id: this.generateId(),
      ...matterData,
      status: 'active',
      dateOpened: new Date().toISOString().split('T')[0],
      lastActivity: new Date().toISOString().split('T')[0],
      billedAmount: 0,
      timeSpent: 0,
      matterNumber: matterData.matterNumber || this.generateMatterNumber(),
      notificationCount: 0
    };

    matters.unshift(newMatter); // Add to beginning of array
    this.saveMatters(matters);

    return newMatter;
  }

  /**
   * Update an existing matter
   */
  static async updateMatter(id: string, updates: Partial<Matter>): Promise<Matter | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));

    const matters = this.loadMatters();
    const index = matters.findIndex(matter => matter.id === id);
    
    if (index === -1) {
      throw new Error(`Matter with ID ${id} not found`);
    }

    matters[index] = {
      ...matters[index],
      ...updates,
      lastActivity: new Date().toISOString().split('T')[0]
    };

    this.saveMatters(matters);
    return matters[index];
  }

  /**
   * Delete a matter
   */
  static async deleteMatter(id: string): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const matters = this.loadMatters();
    const index = matters.findIndex(matter => matter.id === id);
    
    if (index === -1) {
      return false;
    }

    matters.splice(index, 1);
    this.saveMatters(matters);
    return true;
  }

  /**
   * Update matter status
   */
  static async updateMatterStatus(id: string, status: MatterStatus): Promise<Matter | null> {
    return this.updateMatter(id, { 
      status,
      ...(status === 'closed' ? { dateClosed: new Date().toISOString().split('T')[0] } : {})
    });
  }

  /**
   * Update matter stage
   */
  static async updateMatterStage(id: string, stage: MatterStage): Promise<Matter | null> {
    return this.updateMatter(id, { stage });
  }

  /**
   * Load time entries from localStorage
   */
  private static loadTimeEntries(): TimeEntry[] {
    try {
      const stored = localStorage.getItem(this.TIME_ENTRIES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading time entries from localStorage:', error);
      return [];
    }
  }

  /**
   * Save time entries to localStorage
   */
  private static saveTimeEntries(timeEntries: TimeEntry[]): void {
    try {
      localStorage.setItem(this.TIME_ENTRIES_STORAGE_KEY, JSON.stringify(timeEntries));
    } catch (error) {
      console.error('Error saving time entries to localStorage:', error);
    }
  }

  /**
   * Add time entry to matter (enhanced version)
   */
  static async addTimeEntry(id: string, timeEntryData: TimeEntryData): Promise<{ matter: Matter | null; timeEntry: TimeEntry | null }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const matter = await this.getMatter(id);
    if (!matter) return { matter: null, timeEntry: null };

    // Create new time entry
    const timeEntry: TimeEntry = {
      id: this.generateId(),
      matterId: id,
      attorneyId: matter.responsibleAttorneyId,
      attorneyName: matter.responsibleAttorney,
      date: timeEntryData.date,
      hours: timeEntryData.hours,
      description: timeEntryData.description,
      activityType: timeEntryData.activityType,
      rate: timeEntryData.rate,
      billable: timeEntryData.billable,
      tags: timeEntryData.tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save time entry
    const timeEntries = this.loadTimeEntries();
    timeEntries.unshift(timeEntry);
    this.saveTimeEntries(timeEntries);

    // Update matter totals (only for billable time)
    const billingAmount = timeEntryData.billable ? (timeEntryData.hours * timeEntryData.rate) : 0;
    const updatedMatter = await this.updateMatter(id, {
      timeSpent: matter.timeSpent + timeEntryData.hours,
      billedAmount: matter.billedAmount + billingAmount,
      lastActivity: new Date().toISOString().split('T')[0]
    });

    return { matter: updatedMatter, timeEntry };
  }

  /**
   * Get time entries for a matter
   */
  static async getTimeEntriesForMatter(matterId: string): Promise<TimeEntry[]> {
    const allTimeEntries = this.loadTimeEntries();
    return allTimeEntries.filter(entry => entry.matterId === matterId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Get recent time entries for quick duplication
   */
  static async getRecentTimeEntries(limit: number = 10): Promise<TimeEntry[]> {
    const allTimeEntries = this.loadTimeEntries();
    return allTimeEntries
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  /**
   * Search matters by title, description, or matter number
   */
  static async searchMatters(query: string): Promise<Matter[]> {
    if (!query.trim()) {
      return this.getMatters();
    }

    const allMatters = await this.getMatters();
    const searchTerm = query.toLowerCase();

    return allMatters.filter(matter =>
      matter.title.toLowerCase().includes(searchTerm) ||
      matter.description.toLowerCase().includes(searchTerm) ||
      matter.matterNumber?.toLowerCase().includes(searchTerm) ||
      matter.clientName.toLowerCase().includes(searchTerm) ||
      matter.practiceArea.toLowerCase().includes(searchTerm) ||
      matter.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Get matter statistics
   */
  static async getMatterStats(): Promise<{
    total: number;
    active: number;
    closed: number;
    pending: number;
    onHold: number;
    totalBilled: number;
    avgTimeSpent: number;
  }> {
    const allMatters = await this.getMatters();
    
    const stats = {
      total: allMatters.length,
      active: allMatters.filter(m => m.status === 'active').length,
      closed: allMatters.filter(m => m.status === 'closed').length,
      pending: allMatters.filter(m => m.status === 'pending').length,
      onHold: allMatters.filter(m => m.status === 'on_hold').length,
      totalBilled: allMatters.reduce((sum, m) => sum + m.billedAmount, 0),
      avgTimeSpent: allMatters.length > 0 
        ? allMatters.reduce((sum, m) => sum + m.timeSpent, 0) / allMatters.length 
        : 0
    };

    return stats;
  }

  /**
   * Get matters by practice area
   */
  static async getMattersByPracticeArea(): Promise<Record<string, number>> {
    const allMatters = await this.getMatters();
    const practiceAreas: Record<string, number> = {};

    allMatters.forEach(matter => {
      practiceAreas[matter.practiceArea] = (practiceAreas[matter.practiceArea] || 0) + 1;
    });

    return practiceAreas;
  }

  /**
   * Get recent matters (last 30 days)
   */
  static async getRecentMatters(limit: number = 10): Promise<Matter[]> {
    const allMatters = await this.getMatters();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return allMatters
      .filter(matter => new Date(matter.lastActivity) >= thirtyDaysAgo)
      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
      .slice(0, limit);
  }

  /**
   * Get urgent matters (high priority or urgent priority with upcoming deadlines)
   */
  static async getUrgentMatters(): Promise<Matter[]> {
    const allMatters = await this.getMatters();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    return allMatters.filter(matter => 
      matter.status === 'active' && (
        matter.priority === 'urgent' ||
        (matter.priority === 'high' && matter.nextActionDate && new Date(matter.nextActionDate) <= nextWeek)
      )
    );
  }

  /**
   * Initialize billing test matters
   */
  static async initializeBillingTestMatters(): Promise<void> {
    // Check if billing test matters already exist
    const currentMatters = this.loadMatters();
    const hasBillingTestMatters = currentMatters.some(m => 
      ['matter-001', 'matter-002', 'matter-003'].includes(m.id)
    );

    if (!hasBillingTestMatters) {
      // Add billing test matters to existing matters
      const updatedMatters = [...currentMatters, ...this.billingTestMatters];
      this.saveMatters(updatedMatters);
    }
  }
}

export const matterService = MatterService;