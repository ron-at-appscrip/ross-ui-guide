// Frontend service for interacting with email Edge Functions

import { supabase } from '@/integrations/supabase/client';

export interface EmailRequest {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: EmailAttachment[];
  template_id?: string;
  template_variables?: Record<string, any>;
  reply_to?: string;
  from?: string;
  priority?: 'low' | 'normal' | 'high';
  tags?: string[];
  headers?: Record<string, string>;
}

export interface EmailAttachment {
  filename: string;
  content: string; // Base64 encoded
  contentType: string;
  size?: number;
}

export interface InvoiceEmailRequest extends EmailRequest {
  invoice_id: string;
  client_id: string;
  matter_id?: string;
  invoice_number: string;
  amount_due: number;
  due_date: string;
  invoice_pdf_url?: string;
}

export interface ClientCommunicationRequest extends EmailRequest {
  client_id: string;
  matter_id?: string;
  communication_type: 'status_update' | 'meeting_confirmation' | 'document_request' | 'general' | 'billing';
  activity_type?: 'email' | 'phone' | 'meeting' | 'letter' | 'fax' | 'sms';
  billable?: boolean;
  billable_hours?: number;
  follow_up_required?: boolean;
  follow_up_date?: string;
}

export interface EmailResponse {
  success: boolean;
  email_id?: string;
  external_id?: string;
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  rate_limit?: {
    remaining: number;
    reset_at: string;
  };
}

export interface EmailLog {
  id: string;
  user_id: string;
  client_id?: string;
  matter_id?: string;
  email_type: 'general' | 'invoice' | 'communication' | 'notification' | 'marketing';
  to_addresses: string[];
  cc_addresses?: string[];
  bcc_addresses?: string[];
  subject: string;
  content?: string;
  template_id?: string;
  template_variables?: Record<string, any>;
  status: 'pending' | 'sent' | 'delivered' | 'bounced' | 'failed' | 'complained';
  external_id?: string;
  error_message?: string;
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  bounced_at?: string;
  complained_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  text_content?: string;
  variables?: string[];
  category: 'invoice' | 'communication' | 'notification' | 'marketing' | 'system';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailStatistics {
  total_sent: number;
  total_delivered: number;
  total_bounced: number;
  total_failed: number;
  delivery_rate: number;
  bounce_rate: number;
  period_start: string;
  period_end: string;
}

export class EmailService {
  private static async callFunction(functionName: string, payload: any): Promise<EmailResponse> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }

      const response = await supabase.functions.invoke(functionName, {
        body: payload,
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.error) {
        console.error(`Error calling ${functionName}:`, response.error);
        throw new Error(response.error.message || `Failed to call ${functionName}`);
      }

      return response.data;
    } catch (error) {
      console.error(`EmailService.${functionName} error:`, error);
      throw error;
    }
  }

  // Core email sending
  static async sendEmail(request: EmailRequest): Promise<EmailResponse> {
    return this.callFunction('send-email', request);
  }

  // Invoice email sending
  static async sendInvoiceEmail(request: InvoiceEmailRequest): Promise<EmailResponse> {
    return this.callFunction('send-invoice-email', request);
  }

  // Client communication sending
  static async sendClientCommunication(request: ClientCommunicationRequest): Promise<EmailResponse> {
    return this.callFunction('send-client-communication', request);
  }

  // Email logs management
  static async getEmailLogs(filters?: {
    client_id?: string;
    matter_id?: string;
    email_type?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }): Promise<EmailLog[]> {
    try {
      let query = supabase
        .from('email_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters) {
        if (filters.client_id) {
          query = query.eq('client_id', filters.client_id);
        }
        if (filters.matter_id) {
          query = query.eq('matter_id', filters.matter_id);
        }
        if (filters.email_type) {
          query = query.eq('email_type', filters.email_type);
        }
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.start_date) {
          query = query.gte('created_at', filters.start_date);
        }
        if (filters.end_date) {
          query = query.lte('created_at', filters.end_date);
        }
        if (filters.limit) {
          query = query.limit(filters.limit);
        }
        if (filters.offset) {
          query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching email logs:', error);
        throw new Error(`Failed to fetch email logs: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('EmailService.getEmailLogs error:', error);
      throw error;
    }
  }

  static async getEmailLog(emailId: string): Promise<EmailLog | null> {
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .eq('id', emailId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        console.error('Error fetching email log:', error);
        throw new Error(`Failed to fetch email log: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('EmailService.getEmailLog error:', error);
      throw error;
    }
  }

  // Email templates management
  static async getEmailTemplates(category?: string): Promise<EmailTemplate[]> {
    try {
      let query = supabase
        .from('email_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching email templates:', error);
        throw new Error(`Failed to fetch email templates: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('EmailService.getEmailTemplates error:', error);
      throw error;
    }
  }

  static async getEmailTemplate(templateId: string): Promise<EmailTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', templateId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        console.error('Error fetching email template:', error);
        throw new Error(`Failed to fetch email template: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('EmailService.getEmailTemplate error:', error);
      throw error;
    }
  }

  static async createEmailTemplate(template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<EmailTemplate> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .insert([template])
        .select()
        .single();

      if (error) {
        console.error('Error creating email template:', error);
        throw new Error(`Failed to create email template: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('EmailService.createEmailTemplate error:', error);
      throw error;
    }
  }

  static async updateEmailTemplate(templateId: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .update(updates)
        .eq('id', templateId)
        .select()
        .single();

      if (error) {
        console.error('Error updating email template:', error);
        throw new Error(`Failed to update email template: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('EmailService.updateEmailTemplate error:', error);
      throw error;
    }
  }

  static async deleteEmailTemplate(templateId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('email_templates')
        .update({ is_active: false })
        .eq('id', templateId);

      if (error) {
        console.error('Error deleting email template:', error);
        throw new Error(`Failed to delete email template: ${error.message}`);
      }
    } catch (error) {
      console.error('EmailService.deleteEmailTemplate error:', error);
      throw error;
    }
  }

  // Email statistics
  static async getEmailStatistics(
    startDate?: string,
    endDate?: string
  ): Promise<EmailStatistics> {
    try {
      const { data, error } = await supabase
        .rpc('get_email_statistics', {
          user_id_param: (await supabase.auth.getUser()).data.user?.id,
          start_date: startDate,
          end_date: endDate
        });

      if (error) {
        console.error('Error fetching email statistics:', error);
        throw new Error(`Failed to fetch email statistics: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('EmailService.getEmailStatistics error:', error);
      throw error;
    }
  }

  // Utility methods
  static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data:mime/type;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  static async createEmailAttachment(file: File): Promise<EmailAttachment> {
    const base64Content = await this.fileToBase64(file);
    
    return {
      filename: file.name,
      content: base64Content,
      contentType: file.type,
      size: file.size
    };
  }

  static validateEmailAddress(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  static validateEmailAddresses(emails: string[]): string[] {
    return emails
      .map(email => email.trim())
      .filter(email => email.length > 0 && this.validateEmailAddress(email));
  }

  // Quick send methods for common use cases
  static async sendQuickEmail(
    to: string | string[],
    subject: string,
    content: string,
    options?: {
      priority?: 'low' | 'normal' | 'high';
      tags?: string[];
      cc?: string[];
      bcc?: string[];
    }
  ): Promise<EmailResponse> {
    const recipients = Array.isArray(to) ? to : [to];
    
    return this.sendEmail({
      to: recipients,
      cc: options?.cc,
      bcc: options?.bcc,
      subject,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">${content}</div>`,
      text: content.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      priority: options?.priority || 'normal',
      tags: options?.tags
    });
  }

  static async sendTemplatedEmail(
    to: string | string[],
    templateId: string,
    variables: Record<string, any>,
    options?: {
      priority?: 'low' | 'normal' | 'high';
      tags?: string[];
      cc?: string[];
      bcc?: string[];
    }
  ): Promise<EmailResponse> {
    const recipients = Array.isArray(to) ? to : [to];
    
    return this.sendEmail({
      to: recipients,
      cc: options?.cc,
      bcc: options?.bcc,
      template_id: templateId,
      template_variables: variables,
      priority: options?.priority || 'normal',
      tags: options?.tags
    });
  }
}

export default EmailService;