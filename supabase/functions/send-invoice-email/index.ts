import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { EmailService } from "../_shared/email-service.ts";
import { DatabaseService } from "../_shared/database.ts";
import { 
  validateInvoiceEmailRequest, 
  sanitizeEmailRequest 
} from "../_shared/validators.ts";
import { 
  InvoiceEmailRequest, 
  EmailResponse, 
  EmailLogEntry,
  CommunicationActivity 
} from "../_shared/types.ts";

// Default invoice email template
const DEFAULT_INVOICE_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice {{invoice_number}}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .invoice-details { background: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .amount { font-size: 24px; font-weight: bold; color: #28a745; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 14px; color: #6c757d; }
        .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Invoice {{invoice_number}}</h1>
            <p>Dear {{client_name}},</p>
            <p>Please find your invoice details below. Payment is due by {{due_date}}.</p>
        </div>
        
        <div class="invoice-details">
            <h3>Invoice Summary</h3>
            <p><strong>Invoice Number:</strong> {{invoice_number}}</p>
            <p><strong>Invoice Date:</strong> {{invoice_date}}</p>
            <p><strong>Due Date:</strong> {{due_date}}</p>
            {{#matter_title}}
            <p><strong>Matter:</strong> {{matter_title}}</p>
            {{/matter_title}}
            
            <div style="margin: 20px 0;">
                <p><strong>Amount Due:</strong> <span class="amount">{{currency_symbol}}{{amount_due}}</span></p>
            </div>
            
            <p>{{#invoice_pdf_url}}<a href="{{invoice_pdf_url}}" class="button">Download Invoice PDF</a>{{/invoice_pdf_url}}</p>
        </div>
        
        <div>
            <h3>Payment Instructions</h3>
            <p>Please remit payment by {{due_date}} using one of the following methods:</p>
            <ul>
                <li>Online payment portal: [Payment Link]</li>
                <li>Check payable to: {{firm_name}}</li>
                <li>Wire transfer: [Banking Details]</li>
            </ul>
        </div>
        
        <div class="footer">
            <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>
            <p>Thank you for your business.</p>
            <p><strong>{{firm_name}}</strong><br>
            {{firm_address}}<br>
            {{firm_phone}} | {{firm_email}}</p>
        </div>
    </div>
</body>
</html>
`;

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
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'billing@rossai.app';
    const fromName = Deno.env.get('FROM_NAME') || 'Ross AI Billing';
    const firmName = Deno.env.get('FIRM_NAME') || 'Ross AI Legal Services';
    const firmAddress = Deno.env.get('FIRM_ADDRESS') || '';
    const firmPhone = Deno.env.get('FIRM_PHONE') || '';
    const firmEmail = Deno.env.get('FIRM_EMAIL') || fromEmail;

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
    let invoiceRequest: InvoiceEmailRequest;
    try {
      invoiceRequest = await req.json();
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

    console.log(`Processing invoice email request for user: ${user.id}`);

    // Validate request
    const validationErrors = validateInvoiceEmailRequest(invoiceRequest);
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
    const clientValid = await dbService.validateClient(invoiceRequest.client_id, user.id);
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

    if (invoiceRequest.matter_id) {
      const matterValid = await dbService.validateMatter(
        invoiceRequest.matter_id, 
        user.id, 
        invoiceRequest.client_id
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
    const clientInfo = await dbService.getClientInfo(invoiceRequest.client_id);
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
    if (invoiceRequest.matter_id) {
      matterInfo = await dbService.getMatterInfo(invoiceRequest.matter_id);
    }

    // Check if recipient email is provided, otherwise use client email
    if (!invoiceRequest.to || invoiceRequest.to.length === 0) {
      if (clientInfo.email) {
        invoiceRequest.to = [clientInfo.email];
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
    const sanitizedRequest = sanitizeEmailRequest(invoiceRequest);

    // Check for invoice email template
    let templateHtml = invoiceRequest.html || DEFAULT_INVOICE_TEMPLATE;
    let templateText = invoiceRequest.text;

    if (invoiceRequest.template_id) {
      console.log(`Fetching invoice template: ${invoiceRequest.template_id}`);
      const template = await dbService.getEmailTemplate(invoiceRequest.template_id);
      
      if (template && template.category === 'invoice') {
        templateHtml = template.html_content;
        templateText = template.text_content;
      } else {
        console.warn('Invoice template not found, using default template');
      }
    }

    // Prepare template variables
    const templateVariables = {
      client_name: clientInfo.name,
      invoice_number: invoiceRequest.invoice_number,
      invoice_id: invoiceRequest.invoice_id,
      amount_due: invoiceRequest.amount_due.toFixed(2),
      due_date: new Date(invoiceRequest.due_date).toLocaleDateString(),
      invoice_date: new Date().toLocaleDateString(),
      currency_symbol: '$', // Could be made configurable
      matter_title: matterInfo?.title || '',
      invoice_pdf_url: invoiceRequest.invoice_pdf_url || '',
      firm_name: firmName,
      firm_address: firmAddress,
      firm_phone: firmPhone,
      firm_email: firmEmail,
      ...invoiceRequest.template_variables
    };

    // Render template
    const finalHtml = emailService.renderTemplate(templateHtml, templateVariables);
    const finalText = templateText ? 
      emailService.renderTemplate(templateText, templateVariables) : 
      undefined;

    // Generate default subject if not provided
    const finalSubject = sanitizedRequest.subject || 
      `Invoice ${invoiceRequest.invoice_number} - Payment Due ${new Date(invoiceRequest.due_date).toLocaleDateString()}`;

    // Create email log entry
    const emailLogData: Omit<EmailLogEntry, 'id' | 'created_at' | 'updated_at'> = {
      user_id: user.id,
      client_id: invoiceRequest.client_id,
      matter_id: invoiceRequest.matter_id,
      email_type: 'invoice',
      to_addresses: sanitizedRequest.to,
      cc_addresses: sanitizedRequest.cc,
      bcc_addresses: sanitizedRequest.bcc,
      subject: finalSubject,
      content: finalHtml || finalText,
      template_id: invoiceRequest.template_id,
      template_variables: templateVariables,
      status: 'pending',
      metadata: {
        invoice_id: invoiceRequest.invoice_id,
        invoice_number: invoiceRequest.invoice_number,
        amount_due: invoiceRequest.amount_due,
        due_date: invoiceRequest.due_date,
        has_pdf_attachment: !!invoiceRequest.invoice_pdf_url,
        priority: sanitizedRequest.priority || 'high', // Invoices are high priority
        tags: [...(sanitizedRequest.tags || []), 'invoice', 'billing'],
        has_attachments: !!(sanitizedRequest.attachments && sanitizedRequest.attachments.length > 0),
        attachment_count: sanitizedRequest.attachments?.length || 0
      }
    };

    console.log('Creating invoice email log entry...');
    const emailLog = await dbService.logEmail(emailLogData);

    // Prepare final email request
    const finalEmailRequest = {
      ...sanitizedRequest,
      html: finalHtml,
      text: finalText,
      subject: finalSubject,
      priority: (sanitizedRequest.priority || 'high') as 'low' | 'normal' | 'high',
      tags: [...(sanitizedRequest.tags || []), 'invoice', 'billing']
    };

    try {
      // Send email via Resend
      console.log('Sending invoice email via Resend...');
      const result = await emailService.sendEmail(finalEmailRequest);

      // Update email log with success
      await dbService.updateEmailStatus(emailLog.id!, 'sent', {
        external_id: result.id,
        sent_at: new Date().toISOString(),
        provider: 'resend'
      });

      // Log communication activity
      const communicationActivity: Omit<CommunicationActivity, 'id'> = {
        client_id: invoiceRequest.client_id,
        matter_id: invoiceRequest.matter_id,
        activity_type: 'email',
        direction: 'outbound',
        subject: finalSubject,
        content: finalHtml,
        summary: `Invoice ${invoiceRequest.invoice_number} sent to client - Amount due: $${invoiceRequest.amount_due}`,
        participants: [
          {
            id: user.id,
            name: user.email,
            email: user.email,
            role: 'attorney'
          },
          {
            id: invoiceRequest.client_id,
            name: clientInfo.name,
            email: clientInfo.email || sanitizedRequest.to[0],
            role: 'client'
          }
        ],
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        billable: false, // Sending invoices is typically not billable
        status: 'sent',
        priority: 'high',
        tags: ['invoice', 'billing', 'email'],
        attachments: sanitizedRequest.attachments?.map(att => ({
          id: `att_${Date.now()}_${Math.random()}`,
          name: att.filename,
          type: att.contentType,
          size: att.size || 0,
          url: '' // Would be set if stored
        })) || [],
        follow_up_required: true,
        follow_up_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days follow-up
        follow_up_notes: 'Follow up on invoice payment if not received',
        created_by: user.id,
        metadata: {
          email_id: emailLog.id,
          external_id: result.id,
          invoice_id: invoiceRequest.invoice_id,
          invoice_number: invoiceRequest.invoice_number,
          amount_due: invoiceRequest.amount_due,
          due_date: invoiceRequest.due_date,
          source: 'email_function'
        }
      };

      console.log('Logging communication activity...');
      await dbService.logCommunicationActivity(communicationActivity);

      console.log(`Invoice email sent successfully: ${result.id}`);

      const response: EmailResponse = {
        success: true,
        email_id: emailLog.id,
        external_id: result.id,
        message: `Invoice ${invoiceRequest.invoice_number} email sent successfully to ${clientInfo.name}`
      };

      return new Response(
        JSON.stringify(response),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );

    } catch (emailError) {
      console.error('Error sending invoice email:', emailError);
      
      // Update email log with failure
      await dbService.updateEmailStatus(emailLog.id!, 'failed', {
        error_message: emailError instanceof Error ? emailError.message : String(emailError),
        failed_at: new Date().toISOString()
      });

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Failed to send invoice email',
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
    console.error('Unexpected error in send-invoice-email function:', error);
    
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