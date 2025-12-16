import { supabase } from '@/integrations/supabase/client';
import { NewClientData, Client } from '@/types/client';

export interface DatabaseClient {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  client_type: string;
  company_name?: string;
  industry?: string;
  notes?: string;
  is_active: boolean;
  profile_photo_url?: string;
  created_at: string;
  updated_at: string;
}

export class ClientService {
  /**
   * Check if email already exists for another client
   */
  static async checkDuplicateEmail(email: string, excludeClientId?: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .ilike('email', email);

    if (excludeClientId) {
      query = query.neq('id', excludeClientId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error checking duplicate email:', error);
      return false; // Don't block on error
    }

    return (data && data.length > 0);
  }

  /**
   * Check if phone already exists for another client
   */
  static async checkDuplicatePhone(phone: string, excludeClientId?: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Normalize phone number for comparison (remove spaces, dashes, parentheses)
    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');

    let query = supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .or(`phone.ilike.%${normalizedPhone}%`);

    if (excludeClientId) {
      query = query.neq('id', excludeClientId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error checking duplicate phone:', error);
      return false; // Don't block on error
    }

    return (data && data.length > 0);
  }

  /**
   * Create a new client in the database
   */
  static async createClient(clientData: NewClientData): Promise<Client> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Transform frontend data to database format
    const dbClient = {
      user_id: user.id,
      name: clientData.name,
      email: clientData.emails.find(e => e.isPrimary)?.value || clientData.emails[0]?.value || '',
      phone: clientData.phones.find(p => p.isPrimary)?.value || clientData.phones[0]?.value || '',
      address: clientData.addresses.find(a => a.isPrimary)?.street || clientData.addresses[0]?.street || '',
      city: clientData.addresses.find(a => a.isPrimary)?.city || clientData.addresses[0]?.city || '',
      state: clientData.addresses.find(a => a.isPrimary)?.state || clientData.addresses[0]?.state || '',
      zip_code: clientData.addresses.find(a => a.isPrimary)?.zipCode || clientData.addresses[0]?.zipCode || '',
      country: clientData.addresses.find(a => a.isPrimary)?.country || clientData.addresses[0]?.country || 'US',
      client_type: clientData.type,
      company_name: clientData.type === 'company' ? clientData.name : clientData.personDetails?.company || '',
      industry: clientData.industry || '',
      notes: clientData.notes || '',
      profile_photo_url: clientData.profilePhoto || null,
      is_active: clientData.status === 'active'
    };

    const { data, error } = await supabase
      .from('clients')
      .insert([dbClient])
      .select()
      .single();

    if (error) {
      console.error('Error creating client:', error);
      throw new Error(`Failed to create client: ${error.message}`);
    }

    return this.transformDatabaseToClient(data);
  }

  /**
   * Fetch all clients for the current user
   */
  static async getClients(): Promise<Client[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Return mock data for development when auth is disabled
        return this.getMockClients();
      }

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        // Fallback to mock data on error
        return this.getMockClients();
      }

      // If no data in database, return mock data
      if (!data || data.length === 0) {
        console.log('No clients in database, returning mock data');
        return this.getMockClients();
      }

      return data.map(this.transformDatabaseToClient);
    } catch (error) {
      console.warn('Auth not available, using mock clients:', error);
      return this.getMockClients();
    }
  }

  /**
   * Get mock clients for development/testing with comprehensive lead management data
   */
  private static getMockClients(): Client[] {
    return [
      // Converted Clients (Former Leads)
      {
        id: '1',
        name: 'GlobalInnovate Inc.',
        type: 'company',
        status: 'active',
        personDetails: undefined,
        emails: [{ id: '1', value: 'contact@globalinnovate.com', type: 'work', isPrimary: true }],
        phones: [{ id: '1', value: '+1 (555) 123-4567', type: 'work', isPrimary: true }],
        websites: [{ id: '1', url: 'https://globalinnovate.com', type: 'work', isPrimary: true }],
        addresses: [{ 
          id: '1', 
          street: '123 Tech Street', 
          city: 'San Francisco', 
          state: 'CA', 
          zipCode: '94102', 
          country: 'US', 
          type: 'work', 
          isPrimary: true 
        }],
        profilePhoto: undefined,
        primaryContact: 'Sarah Johnson, General Counsel',
        dateAdded: '2024-01-15',
        lastActivity: '2024-12-13',
        totalMatters: 5,
        activeMatters: 2,
        totalBilled: 125000,
        outstandingBalance: 15000,
        industry: 'Technology',
        tags: ['Enterprise', 'VIP', 'Corporate Law'],
        notes: 'Fortune 500 technology company specializing in AI and cloud computing. Excellent payment history.',
        // Lead Management Properties
        leadStatus: 'converted',
        leadScore: 95,
        leadSource: 'Attorney Referral',
        intakeStage: 'completed',
        qualifiedDate: '2024-01-10',
        consultationDate: '2024-01-12',
        conversionDate: '2024-01-15',
        assignedAttorneyId: 'attorney-1',
        referralSource: 'Johnson & Associates'
      },
      {
        id: '2', 
        name: 'John Smith',
        type: 'person',
        status: 'active',
        personDetails: {
          prefix: 'mr',
          firstName: 'John',
          middleName: 'Michael',
          lastName: 'Smith',
          title: 'Software Engineer',
          dateOfBirth: '1985-06-15',
          company: 'TechCorp Inc.'
        },
        emails: [{ id: '1', value: 'john.smith@email.com', type: 'personal', isPrimary: true }],
        phones: [{ id: '1', value: '+1 (555) 987-6543', type: 'mobile', isPrimary: true }],
        websites: [],
        addresses: [{ 
          id: '1', 
          street: '456 Oak Avenue', 
          city: 'Los Angeles', 
          state: 'CA', 
          zipCode: '90210', 
          country: 'US', 
          type: 'home', 
          isPrimary: true 
        }],
        profilePhoto: undefined,
        primaryContact: 'John Smith',
        dateAdded: '2024-02-01',
        lastActivity: '2024-12-10',
        totalMatters: 1,
        activeMatters: 1,
        totalBilled: 8500,
        outstandingBalance: 2500,
        industry: undefined,
        tags: ['Employment Law', 'Individual'],
        notes: 'Employment law matter - wrongful termination case. Responsive and cooperative client.',
        // Lead Management Properties
        leadStatus: 'converted',
        leadScore: 78,
        leadSource: 'Website Contact Form',
        intakeStage: 'completed',
        qualifiedDate: '2024-01-25',
        consultationDate: '2024-01-28',
        conversionDate: '2024-02-01',
        assignedAttorneyId: 'attorney-2',
        referralSource: undefined
      },
      
      // Inactive Client
      {
        id: '3',
        name: 'Tech Solutions Inc',
        type: 'company',
        status: 'inactive',
        personDetails: undefined,
        emails: [{ id: '1', value: 'legal@techstart.com', type: 'work', isPrimary: true }],
        phones: [{ id: '1', value: '+1 (555) 456-7890', type: 'work', isPrimary: true }],
        websites: [{ id: '1', url: 'https://techstart.com', type: 'work', isPrimary: true }],
        addresses: [{ 
          id: '1', 
          street: '789 Innovation Blvd', 
          city: 'Austin', 
          state: 'TX', 
          zipCode: '73301', 
          country: 'US', 
          type: 'work', 
          isPrimary: true 
        }],
        profilePhoto: undefined,
        primaryContact: 'Michael Chen, Managing Partner',
        dateAdded: '2024-12-10',
        lastActivity: '2024-12-13',
        totalMatters: 0,
        activeMatters: 0,
        totalBilled: 0,
        outstandingBalance: 0,
        industry: 'Venture Capital',
        tags: ['High Value', 'Corporate Law', 'M&A'],
        notes: 'Venture capital firm interested in ongoing corporate law support. High-value potential client.',
        // Lead Management Properties
        leadStatus: 'consultation',
        leadScore: 88,
        leadSource: 'Client Referral',
        intakeStage: 'consultation',
        qualifiedDate: '2024-12-11',
        consultationDate: '2024-12-14',
        conversionDate: undefined,
        assignedAttorneyId: 'attorney-1',
        referralSource: 'GlobalInnovate Inc.'
      },
      {
        id: '4',
        name: 'Maria Rodriguez',
        type: 'person',
        status: 'prospect',
        personDetails: {
          prefix: 'ms',
          firstName: 'Maria',
          middleName: '',
          lastName: 'Rodriguez',
          title: 'Marketing Director',
          dateOfBirth: '1980-03-22',
          company: 'Creative Solutions LLC'
        },
        emails: [{ id: '1', value: 'maria.rodriguez@email.com', type: 'personal', isPrimary: true }],
        phones: [{ id: '1', value: '+1 (555) 321-0987', type: 'mobile', isPrimary: true }],
        websites: [],
        addresses: [{ 
          id: '1', 
          street: '321 Pine Street', 
          city: 'Seattle', 
          state: 'WA', 
          zipCode: '98101', 
          country: 'US', 
          type: 'home', 
          isPrimary: true 
        }],
        profilePhoto: undefined,
        primaryContact: 'Maria Rodriguez',
        dateAdded: '2024-12-08',
        lastActivity: '2024-12-12',
        totalMatters: 0,
        activeMatters: 0,
        totalBilled: 0,
        outstandingBalance: 0,
        industry: undefined,
        tags: ['Family Law', 'Divorce', 'Individual'],
        notes: 'Divorce proceedings - complex asset division case. Initial consultation completed.',
        // Lead Management Properties
        leadStatus: 'proposal',
        leadScore: 72,
        leadSource: 'Google Ads',
        intakeStage: 'proposal',
        qualifiedDate: '2024-12-09',
        consultationDate: '2024-12-11',
        conversionDate: undefined,
        assignedAttorneyId: 'attorney-3',
        referralSource: undefined
      },
      {
        id: '5',
        name: 'Regional Manufacturing Corp',
        type: 'company',
        status: 'inactive',
        personDetails: undefined,
        emails: [{ id: '1', value: 'legal@regionalmanuf.com', type: 'work', isPrimary: true }],
        phones: [{ id: '1', value: '+1 (555) 234-5678', type: 'work', isPrimary: true }],
        websites: [{ id: '1', url: 'https://regionalmanuf.com', type: 'work', isPrimary: true }],
        addresses: [{ 
          id: '1', 
          street: '555 Industrial Way', 
          city: 'Detroit', 
          state: 'MI', 
          zipCode: '48201', 
          country: 'US', 
          type: 'work', 
          isPrimary: true 
        }],
        profilePhoto: undefined,
        primaryContact: 'Robert Johnson, HR Director',
        dateAdded: '2024-05-10',
        lastActivity: '2024-12-12',
        totalMatters: 3,
        activeMatters: 1,
        totalBilled: 45000,
        outstandingBalance: 8500,
        industry: 'Manufacturing',
        tags: ['Employment Law', 'Compliance', 'Corporate'],
        notes: 'Employment law and regulatory compliance matters. Ongoing relationship with regular needs.',
        // Lead Management Properties
        leadStatus: 'converted',
        leadScore: 82,
        leadSource: 'Networking Events',
        intakeStage: 'completed',
        qualifiedDate: '2024-05-05',
        consultationDate: '2024-05-08',
        conversionDate: '2024-05-10',
        assignedAttorneyId: 'attorney-2',
        referralSource: undefined
      },
      
      // Additional Leads in Early Stages
      {
        id: '6',
        name: 'David Chen',
        type: 'person',
        status: 'prospect',
        personDetails: {
          prefix: 'mr',
          firstName: 'David',
          middleName: 'Wei',
          lastName: 'Chen',
          title: 'Startup Founder',
          dateOfBirth: '1990-11-08',
          company: 'NextGen Solutions'
        },
        emails: [{ id: '1', value: 'david.chen@nextgen.com', type: 'work', isPrimary: true }],
        phones: [{ id: '1', value: '+1 (555) 789-0123', type: 'mobile', isPrimary: true }],
        websites: [{ id: '1', url: 'https://nextgen.com', type: 'work', isPrimary: true }],
        addresses: [{ 
          id: '1', 
          street: '888 Startup Lane', 
          city: 'San Jose', 
          state: 'CA', 
          zipCode: '95110', 
          country: 'US', 
          type: 'work', 
          isPrimary: true 
        }],
        profilePhoto: undefined,
        primaryContact: 'David Chen',
        dateAdded: '2024-12-13',
        lastActivity: '2024-12-13',
        totalMatters: 0,
        activeMatters: 0,
        totalBilled: 0,
        outstandingBalance: 0,
        industry: 'Technology',
        tags: ['Startup', 'Intellectual Property', 'Corporate'],
        notes: 'Startup founder looking for IP and corporate law support. High growth potential.',
        // Lead Management Properties
        leadStatus: 'qualified',
        leadScore: 85,
        leadSource: 'LinkedIn',
        intakeStage: 'qualification',
        qualifiedDate: '2024-12-13',
        consultationDate: undefined,
        conversionDate: undefined,
        assignedAttorneyId: 'attorney-1',
        referralSource: undefined
      },
      {
        id: '7',
        name: 'Jennifer Walsh',
        type: 'person',
        status: 'prospect',
        personDetails: {
          prefix: 'ms',
          firstName: 'Jennifer',
          middleName: 'Marie',
          lastName: 'Walsh',
          title: 'Real Estate Agent',
          dateOfBirth: '1975-09-14',
          company: 'Premier Properties'
        },
        emails: [{ id: '1', value: 'jennifer.walsh@premier.com', type: 'work', isPrimary: true }],
        phones: [{ id: '1', value: '+1 (555) 654-3210', type: 'work', isPrimary: true }],
        websites: [],
        addresses: [{ 
          id: '1', 
          street: '222 Commerce St', 
          city: 'Miami', 
          state: 'FL', 
          zipCode: '33101', 
          country: 'US', 
          type: 'work', 
          isPrimary: true 
        }],
        profilePhoto: undefined,
        primaryContact: 'Jennifer Walsh',
        dateAdded: '2024-12-12',
        lastActivity: '2024-12-12',
        totalMatters: 0,
        activeMatters: 0,
        totalBilled: 0,
        outstandingBalance: 0,
        industry: 'Real Estate',
        tags: ['Real Estate', 'Contract Review', 'Individual'],
        notes: 'Real estate professional needs contract review and legal guidance. Potential for ongoing relationship.',
        // Lead Management Properties
        leadStatus: 'prospect',
        leadScore: 65,
        leadSource: 'Phone Inquiry',
        intakeStage: 'initial',
        qualifiedDate: undefined,
        consultationDate: undefined,
        conversionDate: undefined,
        assignedAttorneyId: 'attorney-3',
        referralSource: undefined
      },
      {
        id: '8',
        name: 'Wellness Corporation',
        type: 'company',
        status: 'prospect',
        personDetails: undefined,
        emails: [{ id: '1', value: 'legal@wellnesscorp.com', type: 'work', isPrimary: true }],
        phones: [{ id: '1', value: '+1 (555) 111-2222', type: 'work', isPrimary: true }],
        websites: [{ id: '1', url: 'https://wellnesscorp.com', type: 'work', isPrimary: true }],
        addresses: [{ 
          id: '1', 
          street: '100 Health Plaza', 
          city: 'Denver', 
          state: 'CO', 
          zipCode: '80202', 
          country: 'US', 
          type: 'work', 
          isPrimary: true 
        }],
        profilePhoto: undefined,
        primaryContact: 'Dr. Sarah Williams, CEO',
        dateAdded: '2024-12-11',
        lastActivity: '2024-12-11',
        totalMatters: 0,
        activeMatters: 0,
        totalBilled: 0,
        outstandingBalance: 0,
        industry: 'Healthcare',
        tags: ['Healthcare', 'Regulatory', 'Corporate'],
        notes: 'Healthcare company needing regulatory compliance support. Conflict check in progress.',
        // Lead Management Properties
        leadStatus: 'qualified',
        leadScore: 77,
        leadSource: 'Email Marketing',
        intakeStage: 'conflict_check',
        qualifiedDate: '2024-12-11',
        consultationDate: undefined,
        conversionDate: undefined,
        assignedAttorneyId: 'attorney-2',
        referralSource: undefined
      },
      {
        id: '9',
        name: 'Robert Thompson',
        type: 'person',
        status: 'prospect',
        personDetails: {
          prefix: 'mr',
          firstName: 'Robert',
          middleName: 'James',
          lastName: 'Thompson',
          title: 'Small Business Owner',
          dateOfBirth: '1968-12-03',
          company: 'Thompson\'s Auto Repair'
        },
        emails: [{ id: '1', value: 'robert.thompson@auto.com', type: 'work', isPrimary: true }],
        phones: [{ id: '1', value: '+1 (555) 333-4444', type: 'work', isPrimary: true }],
        websites: [],
        addresses: [{ 
          id: '1', 
          street: '456 Main Street', 
          city: 'Phoenix', 
          state: 'AZ', 
          zipCode: '85001', 
          country: 'US', 
          type: 'work', 
          isPrimary: true 
        }],
        profilePhoto: undefined,
        primaryContact: 'Robert Thompson',
        dateAdded: '2024-12-09',
        lastActivity: '2024-12-09',
        totalMatters: 0,
        activeMatters: 0,
        totalBilled: 0,
        outstandingBalance: 0,
        industry: 'Automotive',
        tags: ['Small Business', 'Contract Dispute', 'Individual'],
        notes: 'Small business owner with contract dispute. Budget-conscious client.',
        // Lead Management Properties
        leadStatus: 'lost',
        leadScore: 45,
        leadSource: 'Social Media',
        intakeStage: 'qualification',
        qualifiedDate: '2024-12-09',
        consultationDate: undefined,
        conversionDate: undefined,
        assignedAttorneyId: 'attorney-3',
        referralSource: undefined
      },
      {
        id: '10',
        name: 'Innovation Labs Inc.',
        type: 'company',
        status: 'prospect',
        personDetails: undefined,
        emails: [{ id: '1', value: 'contact@innovationlabs.com', type: 'work', isPrimary: true }],
        phones: [{ id: '1', value: '+1 (555) 777-8888', type: 'work', isPrimary: true }],
        websites: [{ id: '1', url: 'https://innovationlabs.com', type: 'work', isPrimary: true }],
        addresses: [{ 
          id: '1', 
          street: '1000 Research Blvd', 
          city: 'Boston', 
          state: 'MA', 
          zipCode: '02101', 
          country: 'US', 
          type: 'work', 
          isPrimary: true 
        }],
        profilePhoto: undefined,
        primaryContact: 'Dr. Emily Davis, CTO',
        dateAdded: '2024-12-14',
        lastActivity: '2024-12-14',
        totalMatters: 0,
        activeMatters: 0,
        totalBilled: 0,
        outstandingBalance: 0,
        industry: 'Research & Development',
        tags: ['R&D', 'IP', 'Patent Law', 'High Value'],
        notes: 'R&D company with significant IP portfolio. Potential for long-term relationship.',
        // Lead Management Properties
        leadStatus: 'prospect',
        leadScore: 92,
        leadSource: 'Attorney Referral',
        intakeStage: 'initial',
        qualifiedDate: undefined,
        consultationDate: undefined,
        conversionDate: undefined,
        assignedAttorneyId: 'attorney-1',
        referralSource: 'IP Law Partners'
      }
    ];
  }

  /**
   * Fetch clients with server-side pagination and search
   */
  static async getClientsPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'inactive' | 'all';
    type?: 'person' | 'company' | 'all';
    sortBy?: 'name' | 'created_at' | 'updated_at';
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{
    clients: Client[];
    totalCount: number;
    hasMore: boolean;
    page: number;
    totalPages: number;
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const {
      page = 1,
      limit = 10,
      search = '',
      status = 'all',
      type = 'all',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = options;

    const offset = (page - 1) * limit;

    // Build the query
    let query = supabase
      .from('clients')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    // Add search filter
    if (search.trim()) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company_name.ilike.%${search}%`);
    }

    // Add status filter
    if (status !== 'all') {
      query = query.eq('is_active', status === 'active');
    }

    // Add type filter
    if (type !== 'all') {
      query = query.eq('client_type', type);
    }

    // Add sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Add pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching clients:', error);
      throw new Error(`Failed to fetch clients: ${error.message}`);
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    return {
      clients: (data || []).map(this.transformDatabaseToClient),
      totalCount,
      hasMore,
      page,
      totalPages
    };
  }

  /**
   * Get a single client by ID
   */
  static async getClient(id: string): Promise<Client | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Return mock data client if auth fails
        const mockClients = this.getMockClients();
        return mockClients.find(client => client.id === id) || null;
      }

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Client not found
        }
        console.error('Error fetching client:', error);
        throw new Error(`Failed to fetch client: ${error.message}`);
      }

      return this.transformDatabaseToClient(data);
    } catch (error) {
      console.warn('Auth not available, using mock client:', error);
      const mockClients = this.getMockClients();
      return mockClients.find(client => client.id === id) || null;
    }
  }

  /**
   * Get a single client by ID (alias for getClient)
   */
  static async getClientById(id: string): Promise<Client | null> {
    return this.getClient(id);
  }

  /**
   * Update an existing client
   */
  static async updateClient(id: string, clientData: Partial<NewClientData>): Promise<Client> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Transform frontend data to database format (only include provided fields)
    const updateData: Partial<DatabaseClient> = {};
    
    if (clientData.name) updateData.name = clientData.name;
    if (clientData.emails && clientData.emails.length > 0) {
      updateData.email = clientData.emails.find(e => e.isPrimary)?.value || clientData.emails[0]?.value;
    }
    if (clientData.phones && clientData.phones.length > 0) {
      updateData.phone = clientData.phones.find(p => p.isPrimary)?.value || clientData.phones[0]?.value;
    }
    if (clientData.addresses && clientData.addresses.length > 0) {
      const primaryAddress = clientData.addresses.find(a => a.isPrimary) || clientData.addresses[0];
      updateData.address = primaryAddress.street;
      updateData.city = primaryAddress.city;
      updateData.state = primaryAddress.state;
      updateData.zip_code = primaryAddress.zipCode;
      updateData.country = primaryAddress.country;
    }
    if (clientData.type) updateData.client_type = clientData.type;
    if (clientData.industry !== undefined) updateData.industry = clientData.industry;
    if (clientData.notes !== undefined) updateData.notes = clientData.notes;
    if (clientData.profilePhoto !== undefined) updateData.profile_photo_url = clientData.profilePhoto;
    if (clientData.status) updateData.is_active = clientData.status === 'active';

    // Handle company name based on type
    if (clientData.type === 'company' && clientData.name) {
      updateData.company_name = clientData.name;
    } else if (clientData.personDetails?.company !== undefined) {
      updateData.company_name = clientData.personDetails.company;
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating client:', error);
      throw new Error(`Failed to update client: ${error.message}`);
    }

    return this.transformDatabaseToClient(data);
  }

  /**
   * Delete a client
   */
  static async deleteClient(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting client:', error);
      throw new Error(`Failed to delete client: ${error.message}`);
    }
  }

  /**
   * Initialize mock clients in the database for testing
   */
  static async initializeMockClients(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if we already have clients
    const { data: existingClients } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id);

    if (existingClients && existingClients.length > 0) {
      console.log('Clients already exist, skipping initialization');
      return;
    }

    // Get mock clients and convert them to database format
    const mockClients = this.getMockClients();
    
    // Create only the active/converted clients (first 3)
    const clientsToCreate = mockClients.slice(0, 3);
    
    for (const client of clientsToCreate) {
      try {
        await this.createClient({
          name: client.name,
          type: client.type,
          status: client.status,
          emails: client.emails,
          phones: client.phones,
          addresses: client.addresses,
          websites: client.websites || [],
          notes: client.notes || '',
          industry: client.industry,
          tags: client.tags,
          personDetails: client.personDetails
        });
      } catch (error) {
        console.error(`Error creating mock client ${client.name}:`, error);
      }
    }
  }

  /**
   * Search clients by name, email, or company
   */
  static async searchClients(query: string): Promise<Client[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,company_name.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching clients:', error);
      throw new Error(`Failed to search clients: ${error.message}`);
    }

    return data.map(this.transformDatabaseToClient);
  }

  /**
   * Get matter counts for a client
   */
  static async getClientMatterCounts(clientId: string): Promise<{ total: number; active: number }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    try {
      // Get total matters count
      const { count: totalCount, error: totalError } = await supabase
        .from('matters')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .eq('user_id', user.id);

      if (totalError) throw totalError;

      // Get active matters count
      const { count: activeCount, error: activeError } = await supabase
        .from('matters')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .eq('user_id', user.id)
        .eq('status', 'open');

      if (activeError) throw activeError;

      return {
        total: totalCount || 0,
        active: activeCount || 0
      };
    } catch (error) {
      console.error('Error fetching matter counts:', error);
      return { total: 0, active: 0 };
    }
  }

  /**
   * Transform database client record to frontend Client type
   */
  private static transformDatabaseToClient(dbClient: DatabaseClient): Client {
    return {
      id: dbClient.id,
      name: dbClient.name,
      type: dbClient.client_type as 'person' | 'company',
      status: dbClient.is_active ? 'active' : 'inactive',
      
      // Person details (for compatibility with frontend types)
      personDetails: dbClient.client_type === 'person' ? {
        firstName: dbClient.name.split(' ')[0] || '',
        lastName: dbClient.name.split(' ').slice(1).join(' ') || '',
        company: dbClient.company_name || '',
        prefix: '',
        middleName: '',
        title: '',
        dateOfBirth: ''
      } : undefined,

      // Contact information
      emails: dbClient.email ? [{
        id: '1',
        value: dbClient.email,
        type: 'work',
        isPrimary: true
      }] : [],
      
      phones: dbClient.phone ? [{
        id: '1',
        value: dbClient.phone,
        type: 'work',
        isPrimary: true
      }] : [],
      
      websites: [],
      
      addresses: dbClient.address ? [{
        id: '1',
        street: dbClient.address,
        city: dbClient.city || '',
        state: dbClient.state || '',
        zipCode: dbClient.zip_code || '',
        country: dbClient.country || 'US',
        type: 'work',
        isPrimary: true
      }] : [],

      // Business information
      primaryContact: dbClient.name,
      dateAdded: dbClient.created_at.split('T')[0],
      lastActivity: dbClient.updated_at.split('T')[0],
      totalMatters: 0, // TODO: Calculate from matters table
      activeMatters: 0, // TODO: Calculate from matters table
      totalBilled: 0, // TODO: Calculate from billing records
      outstandingBalance: 0, // TODO: Calculate from billing records
      industry: dbClient.industry,
      tags: [], // TODO: Implement tags system
      notes: dbClient.notes,
      profilePhoto: dbClient.profile_photo_url || ''
    };
  }
}

export default ClientService;