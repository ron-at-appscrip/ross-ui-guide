import { supabase } from '@/integrations/supabase/client';
import { render } from '@react-email/render';
import { 
  InvoiceEmailTemplate, 
  ClientCommunicationTemplate, 
  MatterUpdateTemplate,
  WelcomeClientTemplate 
} from '@/components/email-templates';

export interface EmailSendRequest {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  htmlContent?: string;
  textContent?: string;
  templateType?: 'invoice' | 'client_communication' | 'matter_update' | 'welcome' | 'generic';
  templateData?: Record<string, any>;
  clientId?: string;
  matterId?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  attachments?: Array<{
    filename: string;
    content: string; // base64 encoded
    contentType: string;
  }>;
}

export interface EmailLog {
  id: string;
  user_id: string;
  client_id?: string;
  matter_id?: string;
  template_id?: string;
  resend_email_id?: string;
  recipient_email: string;
  recipient_name?: string;
  cc_emails?: string[];
  bcc_emails?: string[];
  subject: string;
  email_type: string;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  error_message?: string;
  metadata?: Record<string, any>;
  sent_at: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  user_id: string;
  name: string;
  subject: string;
  template_type: string;
  html_content: string;
  variables: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class RealEmailService {
  private readonly supabaseUrl = 'https://aiveyvvhlfiqhbaqazrr.supabase.co';

  /**
   * Send email using Supabase Edge Function with Resend integration
   */
  async sendEmail(emailRequest: EmailSendRequest): Promise<EmailLog> {
    try {
      let htmlContent = emailRequest.htmlContent;

      // Generate HTML from React Email template if templateType is provided
      if (emailRequest.templateType && emailRequest.templateData) {
        htmlContent = await this.renderEmailTemplate(
          emailRequest.templateType,
          emailRequest.templateData
        );
      }

      if (!htmlContent) {
        throw new Error('Either htmlContent or templateType with templateData must be provided');
      }

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: emailRequest.to,
          cc: emailRequest.cc,
          bcc: emailRequest.bcc,
          subject: emailRequest.subject,
          html: htmlContent,
          text: emailRequest.textContent,
          clientId: emailRequest.clientId,
          matterId: emailRequest.matterId,
          emailType: emailRequest.templateType || 'generic',
          priority: emailRequest.priority || 'medium',
          attachments: emailRequest.attachments,
          templateData: emailRequest.templateData
        }
      });

      if (error) {
        console.error('Error sending email:', error);
        throw new Error(`Failed to send email: ${error.message}`);
      }

      return data.emailLog;
    } catch (error) {
      console.error('Email service error:', error);
      throw error;
    }
  }

  /**
   * Send invoice email using specialized Edge Function
   */
  async sendInvoiceEmail(invoiceData: {
    clientId: string;
    clientName: string;
    clientEmail: string;
    matterId?: string;
    matterName?: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    lineItems: Array<{
      description: string;
      hours: number;
      rate: number;
      amount: number;
      date: string;
    }>;
    subtotal: number;
    tax?: number;
    total: number;
    paymentInstructions: string;
    attachments?: Array<{
      filename: string;
      content: string;
      contentType: string;
    }>;
  }): Promise<EmailLog> {
    try {
      const { data, error } = await supabase.functions.invoke('send-invoice-email', {
        body: invoiceData
      });

      if (error) {
        console.error('Error sending invoice email:', error);
        throw new Error(`Failed to send invoice email: ${error.message}`);
      }

      return data.emailLog;
    } catch (error) {
      console.error('Invoice email service error:', error);
      throw error;
    }
  }

  /**
   * Send client communication email using specialized Edge Function
   */
  async sendClientCommunication(communicationData: {
    clientId: string;
    clientName: string;
    clientEmail: string;
    matterId?: string;
    matterName?: string;
    subject: string;
    message: string;
    urgency: 'normal' | 'high' | 'urgent';
    communicationType: 'update' | 'request' | 'notice' | 'follow_up';
    attachments?: Array<{
      filename: string;
      content: string;
      contentType: string;
    }>;
    billableTime?: number;
  }): Promise<EmailLog> {
    try {
      const { data, error } = await supabase.functions.invoke('send-client-communication', {
        body: communicationData
      });

      if (error) {
        console.error('Error sending client communication:', error);
        throw new Error(`Failed to send client communication: ${error.message}`);
      }

      return data.emailLog;
    } catch (error) {
      console.error('Client communication service error:', error);
      throw error;
    }
  }

  /**
   * Get email logs for a user with optional filters
   */
  async getEmailLogs(filters?: {
    clientId?: string;
    matterId?: string;
    status?: string;
    emailType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<EmailLog[]> {
    try {
      let query = supabase
        .from('email_logs')
        .select('*')
        .order('sent_at', { ascending: false });

      if (filters) {
        if (filters.clientId) {
          query = query.eq('client_id', filters.clientId);
        }
        if (filters.matterId) {
          query = query.eq('matter_id', filters.matterId);
        }
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.emailType) {
          query = query.eq('email_type', filters.emailType);
        }
        if (filters.startDate) {
          query = query.gte('sent_at', filters.startDate);
        }
        if (filters.endDate) {
          query = query.lte('sent_at', filters.endDate);
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
      console.error('Get email logs error:', error);
      throw error;
    }
  }

  /**
   * Get email templates for the current user
   */
  async getEmailTemplates(templateType?: string): Promise<EmailTemplate[]> {
    try {
      let query = supabase
        .from('email_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (templateType) {
        query = query.eq('template_type', templateType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching email templates:', error);
        throw new Error(`Failed to fetch email templates: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Get email templates error:', error);
      throw error;
    }
  }

  /**
   * Create or update email template
   */
  async saveEmailTemplate(template: {
    id?: string;
    name: string;
    subject: string;
    templateType: string;
    htmlContent: string;
    variables?: Record<string, any>;
  }): Promise<EmailTemplate> {
    try {
      const templateData = {
        name: template.name,
        subject: template.subject,
        template_type: template.templateType,
        html_content: template.htmlContent,
        variables: template.variables || {},
        is_active: true,
        updated_at: new Date().toISOString()
      };

      let result;
      if (template.id) {
        // Update existing template
        result = await supabase
          .from('email_templates')
          .update(templateData)
          .eq('id', template.id)
          .select()
          .single();
      } else {
        // Create new template
        result = await supabase
          .from('email_templates')
          .insert({
            ...templateData,
            created_at: new Date().toISOString()
          })
          .select()
          .single();
      }

      if (result.error) {
        console.error('Error saving email template:', result.error);
        throw new Error(`Failed to save email template: ${result.error.message}`);
      }

      return result.data;
    } catch (error) {
      console.error('Save email template error:', error);
      throw error;
    }
  }

  /**
   * Update email status (typically called by webhooks)
   */
  async updateEmailStatus(emailLogId: string, status: EmailLog['status'], metadata?: Record<string, any>): Promise<void> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      } else if (status === 'opened') {
        updateData.opened_at = new Date().toISOString();
      } else if (status === 'clicked') {
        updateData.clicked_at = new Date().toISOString();
      }

      if (metadata) {
        updateData.metadata = metadata;
      }

      const { error } = await supabase
        .from('email_logs')
        .update(updateData)
        .eq('id', emailLogId);

      if (error) {
        console.error('Error updating email status:', error);
        throw new Error(`Failed to update email status: ${error.message}`);
      }
    } catch (error) {
      console.error('Update email status error:', error);
      throw error;
    }
  }

  /**
   * Get email statistics for dashboard
   */
  async getEmailStats(filters?: {
    clientId?: string;
    matterId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    totalSent: number;
    delivered: number;
    opened: number;
    failed: number;
    byType: Record<string, number>;
    recentEmails: EmailLog[];
  }> {
    try {
      let query = supabase
        .from('email_logs')
        .select('*');

      if (filters) {
        if (filters.clientId) {
          query = query.eq('client_id', filters.clientId);
        }
        if (filters.matterId) {
          query = query.eq('matter_id', filters.matterId);
        }
        if (filters.startDate) {
          query = query.gte('sent_at', filters.startDate);
        }
        if (filters.endDate) {
          query = query.lte('sent_at', filters.endDate);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching email stats:', error);
        throw new Error(`Failed to fetch email stats: ${error.message}`);
      }

      const emails = data || [];
      const byType: Record<string, number> = {};

      emails.forEach(email => {
        byType[email.email_type] = (byType[email.email_type] || 0) + 1;
      });

      return {
        totalSent: emails.length,
        delivered: emails.filter(e => e.status === 'delivered').length,
        opened: emails.filter(e => e.status === 'opened').length,
        failed: emails.filter(e => e.status === 'failed' || e.status === 'bounced').length,
        byType,
        recentEmails: emails.slice(0, 10)
      };
    } catch (error) {
      console.error('Get email stats error:', error);
      throw error;
    }
  }

  /**
   * Render React Email template to HTML
   */
  private async renderEmailTemplate(templateType: string, templateData: Record<string, any>): Promise<string> {
    try {
      let component;

      switch (templateType) {
        case 'invoice':
          component = InvoiceEmailTemplate(templateData);
          break;
        case 'client_communication':
          component = ClientCommunicationTemplate(templateData);
          break;
        case 'matter_update':
          component = MatterUpdateTemplate(templateData);
          break;
        case 'welcome':
          component = WelcomeClientTemplate(templateData);
          break;
        default:
          throw new Error(`Unknown template type: ${templateType}`);
      }

      return render(component);
    } catch (error) {
      console.error('Error rendering email template:', error);
      throw new Error(`Failed to render email template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const realEmailService = new RealEmailService();