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

export interface EmailServiceConfig {
  mode: 'production' | 'development';
  developmentOptions?: {
    simulateDelivery?: boolean;
    simulateOpens?: boolean;
    simulateDelayMs?: number;
    logToConsole?: boolean;
    saveToDatabase?: boolean;
  };
}

class EmailServiceWithDevMode {
  private readonly supabaseUrl = 'https://aiveyvvhlfiqhbaqazrr.supabase.co';
  private config: EmailServiceConfig;

  constructor(config?: EmailServiceConfig) {
    this.config = config || {
      mode: this.detectMode(),
      developmentOptions: {
        simulateDelivery: true,
        simulateOpens: true,
        simulateDelayMs: 1000,
        logToConsole: true,
        saveToDatabase: true
      }
    };
  }

  /**
   * Detect if we're in development or production mode
   */
  private detectMode(): 'production' | 'development' {
    // Check if we have required environment variables
    const hasApiKey = process.env.RESEND_API_KEY || localStorage.getItem('RESEND_API_KEY_DEV');
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    return hasApiKey && !isLocalhost ? 'production' : 'development';
  }

  /**
   * Check if email service is properly configured
   */
  async checkConfiguration(): Promise<{
    isConfigured: boolean;
    mode: string;
    issues: string[];
    suggestions: string[];
  }> {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check Supabase connection
    try {
      const { data, error } = await supabase.from('email_logs').select('id').limit(1);
      if (error) {
        issues.push('Database connection failed: ' + error.message);
        suggestions.push('Check Supabase connection and RLS policies');
      }
    } catch (error) {
      issues.push('Supabase client error');
      suggestions.push('Verify Supabase configuration');
    }

    // Check for API key in production mode
    if (this.config.mode === 'production') {
      try {
        const { data, error } = await supabase.functions.invoke('send-email', {
          body: { test: true }
        });
        if (error && error.message?.includes('RESEND_API_KEY')) {
          issues.push('Resend API key not configured');
          suggestions.push('Add RESEND_API_KEY to Supabase Edge Function secrets');
        }
      } catch (error) {
        issues.push('Edge Function not deployed or not accessible');
        suggestions.push('Deploy Edge Functions and check permissions');
      }
    }

    return {
      isConfigured: issues.length === 0,
      mode: this.config.mode,
      issues,
      suggestions
    };
  }

  /**
   * Send email using either production API or development simulation
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

      if (this.config.mode === 'production') {
        return await this.sendEmailProduction(emailRequest, htmlContent);
      } else {
        return await this.sendEmailDevelopment(emailRequest, htmlContent);
      }
    } catch (error) {
      console.error('Email service error:', error);
      throw error;
    }
  }

  /**
   * Production email sending via Supabase Edge Function
   */
  private async sendEmailProduction(emailRequest: EmailSendRequest, htmlContent: string): Promise<EmailLog> {
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
  }

  /**
   * Development mode email simulation
   */
  private async sendEmailDevelopment(emailRequest: EmailSendRequest, htmlContent: string): Promise<EmailLog> {
    const opts = this.config.developmentOptions!;

    // Create mock email log
    const emailLog: EmailLog = {
      id: `dev_email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: 'dev_user_id',
      client_id: emailRequest.clientId,
      matter_id: emailRequest.matterId,
      template_id: null,
      resend_email_id: `dev_resend_${Date.now()}`,
      recipient_email: emailRequest.to[0],
      recipient_name: emailRequest.to[0].split('@')[0],
      cc_emails: emailRequest.cc,
      bcc_emails: emailRequest.bcc,
      subject: emailRequest.subject,
      email_type: emailRequest.templateType || 'generic',
      status: 'sent',
      metadata: {
        mode: 'development',
        htmlContent: htmlContent.substring(0, 200) + '...',
        attachmentCount: emailRequest.attachments?.length || 0,
        simulatedDelivery: opts.simulateDelivery
      },
      sent_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Log to console if enabled
    if (opts.logToConsole) {
      console.group('📧 Development Email Sent');
      console.log('To:', emailRequest.to);
      console.log('Subject:', emailRequest.subject);
      console.log('Type:', emailRequest.templateType);
      console.log('HTML Preview:', htmlContent.substring(0, 200) + '...');
      console.log('Full Email Log:', emailLog);
      console.groupEnd();
    }

    // Simulate processing delay
    if (opts.simulateDelayMs) {
      await new Promise(resolve => setTimeout(resolve, opts.simulateDelayMs));
    }

    // Save to database if enabled
    if (opts.saveToDatabase) {
      try {
        const { error } = await supabase
          .from('email_logs')
          .insert({
            id: emailLog.id,
            client_id: emailLog.client_id,
            matter_id: emailLog.matter_id,
            recipient_email: emailLog.recipient_email,
            recipient_name: emailLog.recipient_name,
            cc_emails: emailLog.cc_emails,
            bcc_emails: emailLog.bcc_emails,
            subject: emailLog.subject,
            email_type: emailLog.email_type,
            status: emailLog.status,
            metadata: emailLog.metadata,
            sent_at: emailLog.sent_at
          });

        if (error) {
          console.warn('Failed to save development email to database:', error);
        }
      } catch (error) {
        console.warn('Database save error in development mode:', error);
      }
    }

    // Simulate delivery and opens
    if (opts.simulateDelivery) {
      setTimeout(async () => {
        emailLog.status = 'delivered';
        emailLog.delivered_at = new Date().toISOString();
        
        if (opts.saveToDatabase) {
          await this.updateEmailStatus(emailLog.id, 'delivered');
        }
        
        if (opts.logToConsole) {
          console.log('📬 Development Email Delivered:', emailLog.recipient_email);
        }
      }, 2000);
    }

    if (opts.simulateOpens && Math.random() > 0.3) { // 70% open rate simulation
      setTimeout(async () => {
        emailLog.status = 'opened';
        emailLog.opened_at = new Date().toISOString();
        
        if (opts.saveToDatabase) {
          await this.updateEmailStatus(emailLog.id, 'opened');
        }
        
        if (opts.logToConsole) {
          console.log('👀 Development Email Opened:', emailLog.recipient_email);
        }
      }, 5000);
    }

    return emailLog;
  }

  /**
   * Send invoice email using specialized function or simulation
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
    if (this.config.mode === 'production') {
      const { data, error } = await supabase.functions.invoke('send-invoice-email', {
        body: invoiceData
      });

      if (error) {
        console.error('Error sending invoice email:', error);
        throw new Error(`Failed to send invoice email: ${error.message}`);
      }

      return data.emailLog;
    } else {
      // Development mode - simulate invoice email
      return this.sendEmail({
        to: [invoiceData.clientEmail],
        subject: `Invoice ${invoiceData.invoiceNumber} - Payment Due`,
        templateType: 'invoice',
        templateData: invoiceData,
        clientId: invoiceData.clientId,
        matterId: invoiceData.matterId,
        priority: 'high'
      });
    }
  }

  /**
   * Send client communication using specialized function or simulation
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
    if (this.config.mode === 'production') {
      const { data, error } = await supabase.functions.invoke('send-client-communication', {
        body: communicationData
      });

      if (error) {
        console.error('Error sending client communication:', error);
        throw new Error(`Failed to send client communication: ${error.message}`);
      }

      return data.emailLog;
    } else {
      // Development mode - simulate client communication
      return this.sendEmail({
        to: [communicationData.clientEmail],
        subject: communicationData.subject,
        templateType: 'client_communication',
        templateData: communicationData,
        clientId: communicationData.clientId,
        matterId: communicationData.matterId,
        priority: communicationData.urgency === 'urgent' ? 'urgent' : 'medium'
      });
    }
  }

  /**
   * Get email logs with development mode support
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
        
        // In development mode, return mock data if database fails
        if (this.config.mode === 'development') {
          return this.getMockEmailLogs();
        }
        
        throw new Error(`Failed to fetch email logs: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Get email logs error:', error);
      
      // Fallback to mock data in development
      if (this.config.mode === 'development') {
        return this.getMockEmailLogs();
      }
      
      throw error;
    }
  }

  /**
   * Get email templates with development fallback
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
        
        // Return mock templates in development
        if (this.config.mode === 'development') {
          return this.getMockEmailTemplates(templateType);
        }
        
        throw new Error(`Failed to fetch email templates: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Get email templates error:', error);
      
      if (this.config.mode === 'development') {
        return this.getMockEmailTemplates(templateType);
      }
      
      throw error;
    }
  }

  /**
   * Get email statistics with development support
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
      const emails = await this.getEmailLogs(filters);
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
      
      // Return mock stats in development
      if (this.config.mode === 'development') {
        return {
          totalSent: 25,
          delivered: 23,
          opened: 18,
          failed: 2,
          byType: {
            invoice: 8,
            client_communication: 12,
            matter_update: 5
          },
          recentEmails: this.getMockEmailLogs().slice(0, 10)
        };
      }
      
      throw error;
    }
  }

  /**
   * Update email status
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
        if (this.config.mode === 'production') {
          throw new Error(`Failed to update email status: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('Update email status error:', error);
      if (this.config.mode === 'production') {
        throw error;
      }
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

  /**
   * Get mock email logs for development
   */
  private getMockEmailLogs(): EmailLog[] {
    return [
      {
        id: 'dev_email_1',
        user_id: 'dev_user',
        client_id: 'client_1',
        matter_id: 'matter_1',
        template_id: null,
        resend_email_id: 'dev_resend_1',
        recipient_email: 'client@example.com',
        recipient_name: 'John Doe',
        cc_emails: [],
        bcc_emails: [],
        subject: 'Invoice #INV-2024-001 - Payment Due',
        email_type: 'invoice',
        status: 'delivered',
        metadata: { mode: 'development', invoiceNumber: 'INV-2024-001' },
        sent_at: new Date(Date.now() - 86400000).toISOString(),
        delivered_at: new Date(Date.now() - 86340000).toISOString(),
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86340000).toISOString()
      },
      {
        id: 'dev_email_2',
        user_id: 'dev_user',
        client_id: 'client_2',
        matter_id: 'matter_2',
        template_id: null,
        resend_email_id: 'dev_resend_2',
        recipient_email: 'jane@company.com',
        recipient_name: 'Jane Smith',
        cc_emails: [],
        bcc_emails: [],
        subject: 'Case Update - Contract Review Progress',
        email_type: 'client_communication',
        status: 'opened',
        metadata: { mode: 'development', communicationType: 'update' },
        sent_at: new Date(Date.now() - 172800000).toISOString(),
        delivered_at: new Date(Date.now() - 172740000).toISOString(),
        opened_at: new Date(Date.now() - 172000000).toISOString(),
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date(Date.now() - 172000000).toISOString()
      }
    ];
  }

  /**
   * Get mock email templates for development
   */
  private getMockEmailTemplates(templateType?: string): EmailTemplate[] {
    const templates = [
      {
        id: 'template_1',
        user_id: 'dev_user',
        name: 'Invoice Notification',
        subject: 'Invoice {{invoiceNumber}} - Payment Due',
        template_type: 'invoice',
        html_content: '<p>Your invoice is ready for payment...</p>',
        variables: { invoiceNumber: 'string', total: 'number' },
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'template_2',
        user_id: 'dev_user',
        name: 'Case Status Update',
        subject: 'Update on {{matterName}}',
        template_type: 'client_communication',
        html_content: '<p>We have updates on your case...</p>',
        variables: { matterName: 'string', clientName: 'string' },
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    return templateType 
      ? templates.filter(t => t.template_type === templateType)
      : templates;
  }

  /**
   * Configure the service mode and options
   */
  configure(config: Partial<EmailServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfiguration(): EmailServiceConfig {
    return { ...this.config };
  }
}

export const emailServiceWithDevMode = new EmailServiceWithDevMode();