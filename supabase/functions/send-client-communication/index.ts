import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { EmailService } from "../_shared/email-service.ts";
import { DatabaseService } from "../_shared/database.ts";
import { 
  validateClientCommunicationRequest, 
  sanitizeEmailRequest 
} from "../_shared/validators.ts";
import { 
  ClientCommunicationRequest, 
  EmailResponse, 
  EmailLogEntry,
  CommunicationActivity 
} from "../_shared/types.ts";

// Default communication templates by type
const COMMUNICATION_TEMPLATES = {
  status_update: {
    subject: 'Status Update: {{matter_title}}',
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Status Update</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .content { background: #fff; padding: 20px; margin-bottom: 20px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 14px; color: #6c757d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Status Update: {{matter_title}}</h2>
            <p>Dear {{client_name}},</p>
        </div>
        <div class="content">
            {{content}}
        </div>
        <div class="footer">
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p><strong>{{attorney_name}}</strong><br>{{firm_name}}</p>
        </div>
    </div>
</body>
</html>`
  },
  meeting_confirmation: {
    subject: 'Meeting Confirmation: {{meeting_date}}',
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Meeting Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e7f3ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .meeting-details { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 14px; color: #6c757d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Meeting Confirmation</h2>
            <p>Dear {{client_name}},</p>
            <p>This confirms our upcoming meeting scheduled for:</p>
        </div>
        <div class="meeting-details">
            <p><strong>Date:</strong> {{meeting_date}}</p>
            <p><strong>Time:</strong> {{meeting_time}}</p>
            <p><strong>Location/Platform:</strong> {{meeting_location}}</p>
            {{#matter_title}}<p><strong>Matter:</strong> {{matter_title}}</p>{{/matter_title}}
            {{#agenda}}<p><strong>Agenda:</strong> {{agenda}}</p>{{/agenda}}
        </div>
        <div class="content">
            {{content}}
        </div>
        <div class="footer">
            <p>Please let us know if you need to reschedule or have any questions.</p>
            <p><strong>{{attorney_name}}</strong><br>{{firm_name}}</p>
        </div>
    </div>
</body>
</html>`
  },
  document_request: {
    subject: 'Document Request: {{matter_title}}',
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Document Request</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .content { background: #fff; padding: 20px; margin-bottom: 20px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 14px; color: #6c757d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Document Request</h2>
            <p>Dear {{client_name}},</p>
            <p>We need some additional documents for {{matter_title}}.</p>
        </div>
        <div class="content">
            {{content}}
        </div>
        <div class="footer">
            <p>Please provide these documents at your earliest convenience. If you have any questions about what's needed, please contact us.</p>
            <p><strong>{{attorney_name}}</strong><br>{{firm_name}}</p>
        </div>
    </div>
</body>
</html>`
  },
  general: {
    subject: '{{subject}}',
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{subject}}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .content { background: #fff; padding: 20px; margin-bottom: 20px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 14px; color: #6c757d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <p>Dear {{client_name}},</p>
        </div>
        <div class="content">
            {{content}}
        </div>
        <div class="footer">
            <p>Please don't hesitate to contact us if you have any questions.</p>
            <p><strong>{{attorney_name}}</strong><br>{{firm_name}}</p>
        </div>
    </div>
</body>
</html>`
  },
  billing: {
    subject: 'Billing Communication: {{matter_title}}',
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Billing Communication</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #d1ecf1; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .content { background: #fff; padding: 20px; margin-bottom: 20px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 14px; color: #6c757d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Billing Communication</h2>
            <p>Dear {{client_name}},</p>
        </div>
        <div class="content">
            {{content}}
        </div>
        <div class="footer">
            <p>If you have any billing questions, please contact our accounting department.</p>
            <p><strong>{{attorney_name}}</strong><br>{{firm_name}}</p>
        </div>
    </div>
</body>
</html>`
  }
};

Deno.serve(async (req: Request) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Method not allowed. Use POST.' 
      }),
      { 
        status: 405, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'noreply@rossai.app';
    const fromName = Deno.env.get('FROM_NAME') || 'Ross AI';
    const firmName = Deno.env.get('FIRM_NAME') || 'Ross AI Legal Services';

    if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
      console.error('Missing required environment variables');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Server configuration error' 
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    let commRequest: ClientCommunicationRequest;
    try {
      commRequest = await req.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid JSON in request body' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Missing or invalid authorization header' 
        }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    const token = authHeader.substring(7);

    // Initialize services
    const dbService = new DatabaseService(supabaseUrl, supabaseServiceKey);
    const emailService = new EmailService({
      apiKey: resendApiKey,
      fromEmail,
      fromName
    });

    // Authenticate user
    const user = await dbService.getUserFromToken(token);
    if (!user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid or expired authentication token' 
        }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Processing client communication request for user: ${user.id}`);

    // Validate request
    const validationErrors = validateClientCommunicationRequest(commRequest);
    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Validation failed',
          errors: validationErrors 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate client and matter access
    const clientValid = await dbService.validateClient(commRequest.client_id, user.id);
    if (!clientValid) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Client not found or access denied' 
        }),
        { 
          status: 404, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    if (commRequest.matter_id) {
      const matterValid = await dbService.validateMatter(
        commRequest.matter_id, 
        user.id, 
        commRequest.client_id
      );
      if (!matterValid) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Matter not found or access denied' 
          }),
          { 
            status: 404, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Get client information
    const clientInfo = await dbService.getClientInfo(commRequest.client_id);
    if (!clientInfo) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Client information not found' 
        }),
        { 
          status: 404, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get matter information if provided
    let matterInfo = null;
    if (commRequest.matter_id) {
      matterInfo = await dbService.getMatterInfo(commRequest.matter_id);
    }

    // Check if recipient email is provided, otherwise use client email
    if (!commRequest.to || commRequest.to.length === 0) {
      if (clientInfo.email) {
        commRequest.to = [clientInfo.email];
      } else {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'No recipient email address found. Please provide email address or update client record.' 
          }),
          { 
            status: 400, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Sanitize input
    const sanitizedRequest = sanitizeEmailRequest(commRequest);

    // Get template based on communication type
    let templateHtml = commRequest.html;
    let templateText = commRequest.text;
    let templateSubject = commRequest.subject;

    if (commRequest.template_id) {
      // Use custom template
      console.log(`Fetching communication template: ${commRequest.template_id}`);
      const template = await dbService.getEmailTemplate(commRequest.template_id);
      
      if (template && template.category === 'communication') {
        templateHtml = template.html_content;
        templateText = template.text_content;
        templateSubject = template.subject;
      } else {
        console.warn('Communication template not found, using default template');
      }
    }

    // Use default template if no custom template or HTML provided
    if (!templateHtml && COMMUNICATION_TEMPLATES[commRequest.communication_type]) {
      const defaultTemplate = COMMUNICATION_TEMPLATES[commRequest.communication_type];
      templateHtml = defaultTemplate.html;
      templateSubject = templateSubject || defaultTemplate.subject;
    }

    // Prepare template variables
    const templateVariables = {
      client_name: clientInfo.name,
      attorney_name: user.email, // Could be enhanced to get actual attorney name
      firm_name: firmName,
      matter_title: matterInfo?.title || '',
      content: commRequest.html || commRequest.text || 'Please see the details above.',
      communication_type: commRequest.communication_type,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      ...commRequest.template_variables
    };

    // Render template
    const finalHtml = templateHtml ? 
      emailService.renderTemplate(templateHtml, templateVariables) : 
      commRequest.html;
    
    const finalText = templateText ? 
      emailService.renderTemplate(templateText, templateVariables) : 
      commRequest.text;

    // Generate final subject
    const finalSubject = templateSubject ? 
      emailService.renderTemplate(templateSubject, templateVariables) :
      (sanitizedRequest.subject || `Communication: ${matterInfo?.title || 'General'}`);

    // Determine priority based on communication type
    const priorityMap: Record<string, 'low' | 'normal' | 'high'> = {
      status_update: 'normal',
      meeting_confirmation: 'high',
      document_request: 'high',
      general: 'normal',
      billing: 'high'
    };

    const finalPriority = sanitizedRequest.priority || priorityMap[commRequest.communication_type] || 'normal';

    // Create email log entry
    const emailLogData: Omit<EmailLogEntry, 'id' | 'created_at' | 'updated_at'> = {
      user_id: user.id,
      client_id: commRequest.client_id,
      matter_id: commRequest.matter_id,
      email_type: 'communication',
      to_addresses: sanitizedRequest.to,
      cc_addresses: sanitizedRequest.cc,
      bcc_addresses: sanitizedRequest.bcc,
      subject: finalSubject,
      content: finalHtml || finalText,
      template_id: commRequest.template_id,
      template_variables: templateVariables,
      status: 'pending',
      metadata: {
        communication_type: commRequest.communication_type,
        activity_type: commRequest.activity_type || 'email',
        billable: commRequest.billable || false,
        billable_hours: commRequest.billable_hours || 0,
        follow_up_required: commRequest.follow_up_required || false,
        follow_up_date: commRequest.follow_up_date,
        priority: finalPriority,
        tags: [...(sanitizedRequest.tags || []), 'communication', commRequest.communication_type],
        has_attachments: !!(sanitizedRequest.attachments && sanitizedRequest.attachments.length > 0),
        attachment_count: sanitizedRequest.attachments?.length || 0
      }
    };

    console.log('Creating communication email log entry...');
    const emailLog = await dbService.logEmail(emailLogData);

    // Prepare final email request
    const finalEmailRequest = {
      ...sanitizedRequest,
      html: finalHtml,
      text: finalText,
      subject: finalSubject,
      priority: finalPriority,
      tags: [...(sanitizedRequest.tags || []), 'communication', commRequest.communication_type]
    };

    try {
      // Send email via Resend
      console.log('Sending client communication email via Resend...');
      const result = await emailService.sendEmail(finalEmailRequest);

      // Update email log with success
      await dbService.updateEmailStatus(emailLog.id!, 'sent', {
        external_id: result.id,
        sent_at: new Date().toISOString(),
        provider: 'resend'
      });

      // Log communication activity
      const communicationActivity: Omit<CommunicationActivity, 'id'> = {
        client_id: commRequest.client_id,
        matter_id: commRequest.matter_id,
        activity_type: commRequest.activity_type || 'email',
        direction: 'outbound',
        subject: finalSubject,
        content: finalHtml,
        summary: `${commRequest.communication_type.replace('_', ' ')} communication sent to client`,
        participants: [
          {
            id: user.id,
            name: user.email,
            email: user.email,
            role: 'attorney'
          },
          {
            id: commRequest.client_id,
            name: clientInfo.name,
            email: clientInfo.email || sanitizedRequest.to[0],
            role: 'client'
          }
        ],
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        billable: commRequest.billable || false,
        billable_hours: commRequest.billable_hours || 0,
        hourly_rate: commRequest.billable ? 350 : undefined, // Default rate, could be made configurable
        status: 'sent',
        priority: finalPriority,
        tags: ['communication', commRequest.communication_type, 'email'],
        attachments: sanitizedRequest.attachments?.map(att => ({
          id: `att_${Date.now()}_${Math.random()}`,
          name: att.filename,
          type: att.contentType,
          size: att.size || 0,
          url: '' // Would be set if stored
        })) || [],
        follow_up_required: commRequest.follow_up_required || false,
        follow_up_date: commRequest.follow_up_date,
        follow_up_notes: commRequest.follow_up_required ? 'Follow up on client response' : undefined,
        created_by: user.id,
        metadata: {
          email_id: emailLog.id,
          external_id: result.id,
          communication_type: commRequest.communication_type,
          source: 'communication_function'
        }
      };

      console.log('Logging communication activity...');
      await dbService.logCommunicationActivity(communicationActivity);

      console.log(`Client communication email sent successfully: ${result.id}`);

      const response: EmailResponse = {
        success: true,
        email_id: emailLog.id,
        external_id: result.id,
        message: `${commRequest.communication_type.replace('_', ' ')} communication sent successfully to ${clientInfo.name}`
      };

      return new Response(
        JSON.stringify(response),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );

    } catch (emailError) {
      console.error('Error sending client communication email:', emailError);
      
      // Update email log with failure
      await dbService.updateEmailStatus(emailLog.id!, 'failed', {
        error_message: emailError instanceof Error ? emailError.message : String(emailError),
        failed_at: new Date().toISOString()
      });

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Failed to send client communication email',
          email_id: emailLog.id,
          error: emailError instanceof Error ? emailError.message : 'Unknown error'
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Unexpected error in send-client-communication function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
});