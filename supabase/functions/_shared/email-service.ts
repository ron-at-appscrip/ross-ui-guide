// Shared Resend integration utilities for email Edge Functions

import { Resend } from 'https://esm.sh/resend@4.7.0';
import { EmailRequest, EmailAttachment, ResendConfig } from './types.ts';

export class EmailService {
  private resend: Resend;
  private fromEmail: string;
  private fromName: string;

  constructor(config: ResendConfig) {
    this.resend = new Resend(config.apiKey);
    this.fromEmail = config.fromEmail;
    this.fromName = config.fromName;
  }

  async sendEmail(request: EmailRequest): Promise<{ id: string; message: string }> {
    try {
      // Prepare the email payload for Resend
      const emailPayload: any = {
        from: request.from || `${this.fromName} <${this.fromEmail}>`,
        to: request.to,
        subject: request.subject,
        html: request.html,
        text: request.text,
        reply_to: request.reply_to,
        headers: request.headers
      };

      // Add CC and BCC if provided
      if (request.cc && request.cc.length > 0) {
        emailPayload.cc = request.cc;
      }

      if (request.bcc && request.bcc.length > 0) {
        emailPayload.bcc = request.bcc;
      }

      // Add attachments if provided
      if (request.attachments && request.attachments.length > 0) {
        emailPayload.attachments = request.attachments.map((attachment: EmailAttachment) => ({
          filename: attachment.filename,
          content: attachment.content,
          content_type: attachment.contentType
        }));
      }

      // Add tags if provided (Resend supports tags for tracking)
      if (request.tags && request.tags.length > 0) {
        emailPayload.tags = request.tags.map(tag => ({ name: tag, value: 'true' }));
      }

      // Set priority header
      if (request.priority && request.priority !== 'normal') {
        if (!emailPayload.headers) {
          emailPayload.headers = {};
        }
        
        switch (request.priority) {
          case 'high':
            emailPayload.headers['X-Priority'] = '1';
            emailPayload.headers['X-MSMail-Priority'] = 'High';
            emailPayload.headers['Importance'] = 'high';
            break;
          case 'low':
            emailPayload.headers['X-Priority'] = '5';
            emailPayload.headers['X-MSMail-Priority'] = 'Low';
            emailPayload.headers['Importance'] = 'low';
            break;
        }
      }

      console.log('Sending email via Resend with payload:', {
        ...emailPayload,
        attachments: emailPayload.attachments ? 
          emailPayload.attachments.map((att: any) => ({ filename: att.filename, content_type: att.content_type })) : 
          undefined
      });

      // Send email via Resend
      const { data, error } = await this.resend.emails.send(emailPayload);

      if (error) {
        console.error('Resend API error:', error);
        throw new Error(`Failed to send email via Resend: ${error.message || 'Unknown error'}`);
      }

      if (!data || !data.id) {
        console.error('Resend API returned no data or ID');
        throw new Error('Failed to send email: No response data from Resend');
      }

      console.log('Email sent successfully via Resend:', data.id);

      return {
        id: data.id,
        message: 'Email sent successfully'
      };

    } catch (error) {
      console.error('Error in EmailService.sendEmail:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error(`Email service error: ${String(error)}`);
    }
  }

  async getEmailStatus(emailId: string): Promise<any> {
    try {
      // Note: Resend doesn't have a direct status API yet
      // This would be implemented when Resend adds status checking
      console.log('Getting email status for:', emailId);
      
      return {
        id: emailId,
        status: 'sent',
        message: 'Status checking not yet available via Resend API'
      };
    } catch (error) {
      console.error('Error getting email status:', error);
      throw new Error(`Failed to get email status: ${error}`);
    }
  }

  // Utility method to validate Resend API key
  async validateApiKey(): Promise<boolean> {
    try {
      // Try to get domains list as a way to validate the API key
      const domains = await this.resend.domains.list();
      return true;
    } catch (error) {
      console.error('Invalid Resend API key:', error);
      return false;
    }
  }

  // Template rendering helper
  renderTemplate(templateHtml: string, variables: Record<string, any>): string {
    let rendered = templateHtml;
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      rendered = rendered.replace(placeholder, String(value || ''));
    }
    
    return rendered;
  }

  // Email content validation
  validateEmailContent(html?: string, text?: string): { valid: boolean; error?: string } {
    if (!html && !text) {
      return { valid: false, error: 'Either HTML or text content is required' };
    }

    if (html && html.length > 1000000) { // 1MB limit
      return { valid: false, error: 'HTML content exceeds 1MB limit' };
    }

    if (text && text.length > 500000) { // 500KB limit
      return { valid: false, error: 'Text content exceeds 500KB limit' };
    }

    return { valid: true };
  }

  // Attachment validation
  validateAttachments(attachments: EmailAttachment[]): { valid: boolean; error?: string } {
    if (attachments.length > 20) {
      return { valid: false, error: 'Cannot have more than 20 attachments' };
    }

    let totalSize = 0;
    for (const attachment of attachments) {
      if (!attachment.filename || attachment.filename.trim().length === 0) {
        return { valid: false, error: 'All attachments must have a filename' };
      }

      if (!attachment.content || attachment.content.trim().length === 0) {
        return { valid: false, error: 'All attachments must have content' };
      }

      // Rough base64 size calculation
      const size = attachment.size || (attachment.content.length * 0.75);
      
      if (size > 10 * 1024 * 1024) { // 10MB per file
        return { valid: false, error: `Attachment ${attachment.filename} exceeds 10MB limit` };
      }

      totalSize += size;
    }

    if (totalSize > 25 * 1024 * 1024) { // 25MB total
      return { valid: false, error: 'Total attachment size exceeds 25MB limit' };
    }

    return { valid: true };
  }

  // Generate email preview
  generatePreview(content: string, length: number = 150): string {
    // Strip HTML tags for preview
    const textContent = content.replace(/<[^>]*>/g, '');
    
    if (textContent.length <= length) {
      return textContent;
    }
    
    return textContent.substring(0, length).trim() + '...';
  }

  // Email tracking helpers
  addTrackingPixel(html: string, trackingId: string): string {
    const trackingPixel = `<img src="${this.fromEmail}/track/open/${trackingId}" width="1" height="1" style="display:none;" alt="" />`;
    
    // Try to add before closing body tag, otherwise append to end
    if (html.includes('</body>')) {
      return html.replace('</body>', `${trackingPixel}</body>`);
    }
    
    return html + trackingPixel;
  }

  addClickTracking(html: string, trackingId: string): string {
    // In a full implementation, this would wrap all links with tracking URLs
    // For now, just return the original HTML
    return html;
  }
}