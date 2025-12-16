// Shared database operations for email logging and management

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { EmailLogEntry, CommunicationActivity, EmailTemplate } from './types.ts';

export class DatabaseService {
  private supabase;

  constructor(supabaseUrl: string, supabaseServiceKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  // Email logging operations
  async logEmail(entry: Omit<EmailLogEntry, 'id' | 'created_at' | 'updated_at'>): Promise<EmailLogEntry> {
    const { data, error } = await this.supabase
      .from('email_logs')
      .insert([{
        ...entry,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error logging email:', error);
      throw new Error(`Failed to log email: ${error.message}`);
    }

    return data;
  }

  async updateEmailStatus(
    emailId: string, 
    status: EmailLogEntry['status'], 
    metadata?: Record<string, any>
  ): Promise<void> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    // Set timestamp fields based on status
    switch (status) {
      case 'sent':
        updateData.sent_at = new Date().toISOString();
        break;
      case 'delivered':
        updateData.delivered_at = new Date().toISOString();
        break;
      case 'bounced':
        updateData.bounced_at = new Date().toISOString();
        break;
      case 'complained':
        updateData.complained_at = new Date().toISOString();
        break;
    }

    if (metadata) {
      updateData.metadata = metadata;
    }

    const { error } = await this.supabase
      .from('email_logs')
      .update(updateData)
      .eq('id', emailId);

    if (error) {
      console.error('Error updating email status:', error);
      throw new Error(`Failed to update email status: ${error.message}`);
    }
  }

  async getEmailLog(emailId: string): Promise<EmailLogEntry | null> {
    const { data, error } = await this.supabase
      .from('email_logs')
      .select('*')
      .eq('id', emailId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Record not found
      }
      console.error('Error fetching email log:', error);
      throw new Error(`Failed to fetch email log: ${error.message}`);
    }

    return data;
  }

  async getEmailLogsByExternalId(externalId: string): Promise<EmailLogEntry[]> {
    const { data, error } = await this.supabase
      .from('email_logs')
      .select('*')
      .eq('external_id', externalId);

    if (error) {
      console.error('Error fetching email logs by external ID:', error);
      throw new Error(`Failed to fetch email logs: ${error.message}`);
    }

    return data || [];
  }

  // Communication activity operations
  async logCommunicationActivity(activity: Omit<CommunicationActivity, 'id'>): Promise<CommunicationActivity> {
    const { data, error } = await this.supabase
      .from('lead_activities')
      .insert([{
        lead_id: activity.client_id,
        activity_type: activity.activity_type,
        title: activity.subject,
        description: activity.content || activity.summary,
        status: activity.status === 'sent' ? 'completed' : 'pending',
        priority: activity.priority,
        created_by: activity.created_by,
        metadata: {
          ...activity.metadata,
          direction: activity.direction,
          participants: activity.participants,
          billable: activity.billable,
          billable_hours: activity.billable_hours,
          hourly_rate: activity.hourly_rate,
          tags: activity.tags,
          attachments: activity.attachments,
          follow_up_required: activity.follow_up_required,
          follow_up_date: activity.follow_up_date,
          follow_up_notes: activity.follow_up_notes,
          reminder_date: activity.reminder_date,
          matter_id: activity.matter_id,
          date: activity.date,
          time: activity.time,
          duration: activity.duration
        }
      }])
      .select()
      .single();

    if (error) {
      console.error('Error logging communication activity:', error);
      throw new Error(`Failed to log communication activity: ${error.message}`);
    }

    return {
      id: data.id,
      client_id: data.lead_id,
      matter_id: activity.matter_id,
      activity_type: activity.activity_type,
      direction: activity.direction,
      subject: data.title,
      content: activity.content,
      summary: activity.summary,
      participants: activity.participants,
      date: activity.date,
      time: activity.time,
      duration: activity.duration,
      billable: activity.billable,
      billable_hours: activity.billable_hours,
      hourly_rate: activity.hourly_rate,
      status: activity.status,
      priority: activity.priority,
      tags: activity.tags,
      attachments: activity.attachments,
      follow_up_required: activity.follow_up_required,
      follow_up_date: activity.follow_up_date,
      follow_up_notes: activity.follow_up_notes,
      reminder_date: activity.reminder_date,
      created_by: activity.created_by,
      metadata: activity.metadata
    };
  }

  // Template operations
  async getEmailTemplate(templateId: string): Promise<EmailTemplate | null> {
    const { data, error } = await this.supabase
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Record not found
      }
      console.error('Error fetching email template:', error);
      throw new Error(`Failed to fetch email template: ${error.message}`);
    }

    return data;
  }

  async getEmailTemplateByCategory(category: string): Promise<EmailTemplate[]> {
    const { data, error } = await this.supabase
      .from('email_templates')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching email templates by category:', error);
      throw new Error(`Failed to fetch email templates: ${error.message}`);
    }

    return data || [];
  }

  // Client and matter validation
  async validateClient(clientId: string, userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return false; // Client not found or not accessible
      }
      console.error('Error validating client:', error);
      throw new Error(`Failed to validate client: ${error.message}`);
    }

    return !!data;
  }

  async validateMatter(matterId: string, userId: string, clientId?: string): Promise<boolean> {
    let query = this.supabase
      .from('matters')
      .select('id')
      .eq('id', matterId);

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    // In a real implementation, you would also check user access to the matter
    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return false; // Matter not found or not accessible
      }
      console.error('Error validating matter:', error);
      throw new Error(`Failed to validate matter: ${error.message}`);
    }

    return !!data;
  }

  async getClientInfo(clientId: string): Promise<{ name: string; email: string } | null> {
    const { data, error } = await this.supabase
      .from('clients')
      .select('name, email')
      .eq('id', clientId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching client info:', error);
      throw new Error(`Failed to fetch client info: ${error.message}`);
    }

    return data;
  }

  async getMatterInfo(matterId: string): Promise<{ title: string; client_id: string } | null> {
    const { data, error } = await this.supabase
      .from('matters')
      .select('title, client_id')
      .eq('id', matterId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching matter info:', error);
      throw new Error(`Failed to fetch matter info: ${error.message}`);
    }

    return data;
  }

  // User validation
  async getUserFromToken(token: string): Promise<{ id: string; email: string } | null> {
    const { data: { user }, error } = await this.supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email || ''
    };
  }

  // Rate limiting helpers (in production, use Redis)
  async checkEmailRateLimit(userId: string): Promise<{ allowed: boolean; remaining: number }> {
    // For now, return a simple check
    // In production, implement proper rate limiting with Redis
    return {
      allowed: true,
      remaining: 100
    };
  }

  async incrementEmailCount(userId: string): Promise<void> {
    // In production, increment rate limit counters
    // For now, this is a no-op
  }
}