import { Client } from '@/types/client';
import { 
  LeadSource, 
  LeadActivity, 
  LeadAnalytics, 
  LeadFilters, 
  LeadScoringFactors, 
  ConflictCheck,
  LeadTimelineEvent,
  LeadConversionData,
  DEFAULT_LEAD_SOURCES,
  DEFAULT_INTAKE_STAGES
} from '@/types/lead';
import { supabase } from '@/integrations/supabase/client';
import { generateId } from '@/lib/utils';

/**
 * Lead Management Service
 * Handles all lead-related operations including scoring, conversion, and analytics
 */
export class LeadService {
  private static useMockData = true; // Toggle for development

  /**
   * Get all lead sources
   */
  static async getLeadSources(): Promise<LeadSource[]> {
    if (this.useMockData) {
      return this.getMockLeadSources();
    }

    try {
      const { data, error } = await supabase
        .from('lead_sources')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching lead sources:', error);
      return this.getMockLeadSources();
    }
  }

  /**
   * Create a new lead source
   */
  static async createLeadSource(source: Omit<LeadSource, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeadSource> {
    if (this.useMockData) {
      const newSource: LeadSource = {
        ...source,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return newSource;
    }

    const { data, error } = await supabase
      .from('lead_sources')
      .insert([{
        name: source.name,
        category: source.category,
        description: source.description,
        tracking_code: source.trackingCode,
        cost_per_lead: source.costPerLead,
        is_active: source.isActive
      }])
      .select()
      .single();

    if (error) throw error;
    return this.transformDatabaseLeadSource(data);
  }

  /**
   * Get lead activities for a specific lead
   */
  static async getLeadActivities(leadId: string): Promise<LeadActivity[]> {
    if (this.useMockData) {
      return this.getMockLeadActivities(leadId);
    }

    try {
      const { data, error } = await supabase
        .from('lead_activities')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data?.map(this.transformDatabaseActivity) || [];
    } catch (error) {
      console.error('Error fetching lead activities:', error);
      return this.getMockLeadActivities(leadId);
    }
  }

  /**
   * Create a new lead activity
   */
  static async createLeadActivity(activity: Omit<LeadActivity, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeadActivity> {
    if (this.useMockData) {
      const newActivity: LeadActivity = {
        ...activity,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return newActivity;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('lead_activities')
      .insert([{
        lead_id: activity.leadId,
        activity_type: activity.activityType,
        title: activity.title,
        description: activity.description,
        scheduled_date: activity.scheduledDate,
        due_date: activity.dueDate,
        status: activity.status,
        priority: activity.priority,
        assigned_to: activity.assignedTo,
        created_by: user.id,
        metadata: activity.metadata
      }])
      .select()
      .single();

    if (error) throw error;
    return this.transformDatabaseActivity(data);
  }

  /**
   * Update lead activity
   */
  static async updateLeadActivity(id: string, updates: Partial<LeadActivity>): Promise<LeadActivity> {
    if (this.useMockData) {
      return {
        ...updates,
        id,
        updatedAt: new Date().toISOString()
      } as LeadActivity;
    }

    const { data, error } = await supabase
      .from('lead_activities')
      .update({
        title: updates.title,
        description: updates.description,
        scheduled_date: updates.scheduledDate,
        completed_date: updates.completedDate,
        due_date: updates.dueDate,
        status: updates.status,
        priority: updates.priority,
        assigned_to: updates.assignedTo,
        metadata: updates.metadata
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.transformDatabaseActivity(data);
  }

  /**
   * Calculate lead score based on multiple factors
   */
  static calculateLeadScore(factors: LeadScoringFactors): number {
    const {
      matterUrgency,
      budgetRange,
      referralQuality,
      responseTime,
      practiceAreaMatch,
      geographicMatch
    } = factors;

    // Weighted scoring algorithm
    const weights = {
      matterUrgency: 0.2,
      budgetRange: 0.25,
      referralQuality: 0.2,
      responseTime: 0.15,
      practiceAreaMatch: 0.1,
      geographicMatch: 0.1
    };

    const score = Math.round(
      (matterUrgency * weights.matterUrgency) +
      (budgetRange * weights.budgetRange) +
      (referralQuality * weights.referralQuality) +
      (responseTime * weights.responseTime) +
      (practiceAreaMatch * weights.practiceAreaMatch) +
      (geographicMatch * weights.geographicMatch)
    );

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Update lead score
   */
  static async updateLeadScore(leadId: string, score: number): Promise<void> {
    if (this.useMockData) {
      console.log(`Mock: Updated lead ${leadId} score to ${score}`);
      return;
    }

    const { error } = await supabase
      .from('clients')
      .update({ lead_score: score })
      .eq('id', leadId);

    if (error) throw error;
  }

  /**
   * Advance lead to next intake stage
   */
  static async advanceIntakeStage(leadId: string, newStage: string): Promise<void> {
    if (this.useMockData) {
      console.log(`Mock: Advanced lead ${leadId} to stage ${newStage}`);
      return;
    }

    const { error } = await supabase
      .from('clients')
      .update({ 
        intake_stage: newStage,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId);

    if (error) throw error;
  }

  /**
   * Update lead status
   */
  static async updateLeadStatus(leadId: string, status: string): Promise<void> {
    if (this.useMockData) {
      console.log(`Mock: Updated lead ${leadId} status to ${status}`);
      return;
    }

    const updates: any = { 
      lead_status: status,
      updated_at: new Date().toISOString()
    };

    // Set conversion date if converting to client
    if (status === 'converted') {
      updates.conversion_date = new Date().toISOString();
    }

    const { error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', leadId);

    if (error) throw error;
  }

  /**
   * Create conflict check
   */
  static async createConflictCheck(leadId: string, checkType: 'automatic' | 'manual' | 'external'): Promise<ConflictCheck> {
    if (this.useMockData) {
      return {
        id: generateId(),
        clientId: leadId,
        checkType,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    const { data, error } = await supabase
      .from('conflict_checks')
      .insert([{
        client_id: leadId,
        check_type: checkType,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;
    return this.transformDatabaseConflictCheck(data);
  }

  /**
   * Get conflict check for lead
   */
  static async getConflictCheck(leadId: string): Promise<ConflictCheck | null> {
    if (this.useMockData) {
      return {
        id: generateId(),
        clientId: leadId,
        checkType: 'automatic',
        status: 'clear',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    const { data, error } = await supabase
      .from('conflict_checks')
      .select('*')
      .eq('client_id', leadId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return this.transformDatabaseConflictCheck(data);
  }

  /**
   * Convert lead to client
   */
  static async convertLeadToClient(leadId: string, conversionData: LeadConversionData): Promise<void> {
    if (this.useMockData) {
      console.log(`Mock: Converted lead ${leadId} to client`);
      return;
    }

    const { error } = await supabase
      .from('clients')
      .update({
        lead_status: 'converted',
        intake_stage: 'completed',
        conversion_date: conversionData.conversionDate,
        status: 'active'
      })
      .eq('id', leadId);

    if (error) throw error;

    // Create conversion activity
    await this.createLeadActivity({
      leadId,
      activityType: 'note',
      title: 'Lead Converted to Client',
      description: conversionData.conversionNotes || 'Lead successfully converted to client',
      status: 'completed',
      priority: 'high',
      createdBy: conversionData.convertedBy
    });
  }

  /**
   * Get lead analytics
   */
  static async getLeadAnalytics(dateRange?: { start: string; end: string }): Promise<LeadAnalytics> {
    if (this.useMockData) {
      return this.getMockLeadAnalytics();
    }

    try {
      // This would involve complex queries to calculate analytics
      // For now, return mock data
      return this.getMockLeadAnalytics();
    } catch (error) {
      console.error('Error fetching lead analytics:', error);
      return this.getMockLeadAnalytics();
    }
  }

  /**
   * Get lead timeline events
   */
  static async getLeadTimeline(leadId: string): Promise<LeadTimelineEvent[]> {
    if (this.useMockData) {
      return this.getMockLeadTimeline(leadId);
    }

    // In a real implementation, this would query multiple tables
    // to build a comprehensive timeline
    return this.getMockLeadTimeline(leadId);
  }

  /**
   * Filter leads based on criteria
   */
  static async filterLeads(filters: LeadFilters): Promise<Client[]> {
    if (this.useMockData) {
      return this.getMockFilteredLeads(filters);
    }

    let query = supabase
      .from('clients')
      .select('*');

    // Apply filters
    if (filters.status?.length) {
      query = query.in('lead_status', filters.status);
    }

    if (filters.stage?.length) {
      query = query.in('intake_stage', filters.stage);
    }

    if (filters.source?.length) {
      query = query.in('lead_source', filters.source);
    }

    if (filters.scoreRange) {
      query = query
        .gte('lead_score', filters.scoreRange.min)
        .lte('lead_score', filters.scoreRange.max);
    }

    if (filters.dateRange) {
      query = query
        .gte('created_at', filters.dateRange.start)
        .lte('created_at', filters.dateRange.end);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data?.map(this.transformDatabaseToClient) || [];
  }

  // Mock data methods
  private static getMockLeadSources(): LeadSource[] {
    return DEFAULT_LEAD_SOURCES.map((source, index) => ({
      ...source,
      id: `source-${index + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  }

  private static getMockLeadActivities(leadId: string): LeadActivity[] {
    return [
      {
        id: 'activity-1',
        leadId,
        activityType: 'contact',
        title: 'Initial Contact',
        description: 'Lead contacted us through website form',
        status: 'completed',
        priority: 'medium',
        createdBy: 'user-1',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'activity-2',
        leadId,
        activityType: 'call',
        title: 'Follow-up Call',
        description: 'Scheduled follow-up call to discuss matter details',
        status: 'pending',
        priority: 'high',
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'user-1',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  private static getMockLeadAnalytics(): LeadAnalytics {
    return {
      totalLeads: 145,
      conversionRate: 28.5,
      averageLeadScore: 72,
      averageIntakeTime: 12.3,
      leadsBySource: [
        { source: 'Website Contact Form', count: 45, conversionRate: 32.1 },
        { source: 'Client Referral', count: 38, conversionRate: 45.2 },
        { source: 'Attorney Referral', count: 25, conversionRate: 52.0 },
        { source: 'Google Ads', count: 20, conversionRate: 15.8 },
        { source: 'Social Media', count: 17, conversionRate: 18.5 }
      ],
      leadsByStage: [
        { stage: 'initial', count: 25 },
        { stage: 'qualification', count: 35 },
        { stage: 'conflict_check', count: 15 },
        { stage: 'consultation', count: 28 },
        { stage: 'proposal', count: 18 },
        { stage: 'onboarding', count: 12 },
        { stage: 'completed', count: 12 }
      ],
      leadsByStatus: [
        { status: 'prospect', count: 58 },
        { status: 'qualified', count: 42 },
        { status: 'consultation', count: 28 },
        { status: 'proposal', count: 18 },
        { status: 'converted', count: 12 },
        { status: 'lost', count: 8 }
      ],
      monthlyTrends: [
        { month: 'Jan 2024', leads: 42, conversions: 12, conversionRate: 28.6 },
        { month: 'Feb 2024', leads: 38, conversions: 11, conversionRate: 28.9 },
        { month: 'Mar 2024', leads: 45, conversions: 15, conversionRate: 33.3 },
        { month: 'Apr 2024', leads: 52, conversions: 18, conversionRate: 34.6 },
        { month: 'May 2024', leads: 48, conversions: 14, conversionRate: 29.2 },
        { month: 'Jun 2024', leads: 51, conversions: 16, conversionRate: 31.4 }
      ]
    };
  }

  private static getMockLeadTimeline(leadId: string): LeadTimelineEvent[] {
    return [
      {
        id: 'event-1',
        leadId,
        eventType: 'activity',
        title: 'Lead Created',
        description: 'New lead captured from website contact form',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'system'
      },
      {
        id: 'event-2',
        leadId,
        eventType: 'status_change',
        title: 'Status Updated',
        description: 'Lead status changed from prospect to qualified',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'user-1'
      },
      {
        id: 'event-3',
        leadId,
        eventType: 'stage_change',
        title: 'Stage Advanced',
        description: 'Lead moved to consultation stage',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'user-1'
      }
    ];
  }

  private static getMockFilteredLeads(filters: LeadFilters): Client[] {
    // Return mock filtered results
    return [];
  }

  // Database transformation methods
  private static transformDatabaseLeadSource(data: any): LeadSource {
    return {
      id: data.id,
      name: data.name,
      category: data.category,
      description: data.description,
      trackingCode: data.tracking_code,
      costPerLead: data.cost_per_lead,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  private static transformDatabaseActivity(data: any): LeadActivity {
    return {
      id: data.id,
      leadId: data.lead_id,
      activityType: data.activity_type,
      title: data.title,
      description: data.description,
      scheduledDate: data.scheduled_date,
      completedDate: data.completed_date,
      dueDate: data.due_date,
      status: data.status,
      priority: data.priority,
      assignedTo: data.assigned_to,
      createdBy: data.created_by,
      metadata: data.metadata,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  private static transformDatabaseConflictCheck(data: any): ConflictCheck {
    return {
      id: data.id,
      clientId: data.client_id,
      checkType: data.check_type,
      status: data.status,
      conflictDetails: data.conflict_details,
      resolutionNotes: data.resolution_notes,
      checkedBy: data.checked_by,
      checkedDate: data.checked_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  private static transformDatabaseToClient(data: any): Client {
    // Transform database client to Client type
    // This would be similar to the existing ClientService transformation
    return {
      id: data.id,
      name: data.name,
      type: data.client_type,
      status: data.is_active ? 'active' : 'inactive',
      emails: data.email ? [{ id: '1', value: data.email, type: 'work', isPrimary: true }] : [],
      phones: data.phone ? [{ id: '1', value: data.phone, type: 'work', isPrimary: true }] : [],
      websites: [],
      addresses: [],
      primaryContact: data.name,
      dateAdded: data.created_at?.split('T')[0] || '',
      lastActivity: data.updated_at?.split('T')[0] || '',
      totalMatters: 0,
      activeMatters: 0,
      totalBilled: 0,
      outstandingBalance: 0,
      industry: data.industry,
      tags: [],
      notes: data.notes,
      profilePhoto: data.profile_photo_url,
      leadStatus: data.lead_status,
      leadScore: data.lead_score,
      leadSource: data.lead_source,
      intakeStage: data.intake_stage,
      qualifiedDate: data.qualified_date,
      consultationDate: data.consultation_date,
      conversionDate: data.conversion_date,
      assignedAttorneyId: data.assigned_attorney_id,
      referralSource: data.referral_source
    };
  }
}

export default LeadService;