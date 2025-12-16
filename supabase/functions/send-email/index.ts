import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { EmailService } from "../_shared/email-service.ts";
import { DatabaseService } from "../_shared/database.ts";
import { 
  validateEmailRequest, 
  sanitizeEmailRequest, 
  checkRateLimit 
} from "../_shared/validators.ts";
import { 
  EmailRequest, 
  EmailResponse, 
  EmailLogEntry 
} from "../_shared/types.ts";

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
    let emailRequest: EmailRequest;
    try {
      emailRequest = await req.json();
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

    console.log(`Processing email request for user: ${user.id}`);

    // Check rate limits
    const rateLimitResult = await dbService.checkEmailRateLimit(user.id);
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Rate limit exceeded. Please try again later.',
          rate_limit: {
            remaining: 0,
            reset_at: new Date(Date.now() + 60000).toISOString()
          }
        }),
        { 
          status: 429, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate request
    const validationErrors = validateEmailRequest(emailRequest);
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

    // Sanitize input
    const sanitizedRequest = sanitizeEmailRequest(emailRequest);

    // Handle template rendering if template_id is provided
    let finalHtml = sanitizedRequest.html;
    let finalText = sanitizedRequest.text;

    if (sanitizedRequest.template_id) {
      console.log(`Fetching template: ${sanitizedRequest.template_id}`);
      const template = await dbService.getEmailTemplate(sanitizedRequest.template_id);
      
      if (!template) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Email template not found or inactive' 
          }),
          { 
            status: 404, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      }

      // Render template with variables
      const variables = sanitizedRequest.template_variables || {};
      finalHtml = emailService.renderTemplate(template.html_content, variables);
      finalText = template.text_content ? 
        emailService.renderTemplate(template.text_content, variables) : 
        undefined;

      // Use template subject if not provided
      if (!sanitizedRequest.subject && template.subject) {
        sanitizedRequest.subject = emailService.renderTemplate(template.subject, variables);
      }
    }

    // Validate final content
    const contentValidation = emailService.validateEmailContent(finalHtml, finalText);
    if (!contentValidation.valid) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: contentValidation.error 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate attachments if provided
    if (sanitizedRequest.attachments && sanitizedRequest.attachments.length > 0) {
      const attachmentValidation = emailService.validateAttachments(sanitizedRequest.attachments);
      if (!attachmentValidation.valid) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: attachmentValidation.error 
          }),
          { 
            status: 400, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Create email log entry
    const emailLogData: Omit<EmailLogEntry, 'id' | 'created_at' | 'updated_at'> = {
      user_id: user.id,
      email_type: 'general',
      to_addresses: sanitizedRequest.to,
      cc_addresses: sanitizedRequest.cc,
      bcc_addresses: sanitizedRequest.bcc,
      subject: sanitizedRequest.subject,
      content: finalHtml || finalText,
      template_id: sanitizedRequest.template_id,
      template_variables: sanitizedRequest.template_variables,
      status: 'pending',
      metadata: {
        priority: sanitizedRequest.priority || 'normal',
        tags: sanitizedRequest.tags || [],
        has_attachments: !!(sanitizedRequest.attachments && sanitizedRequest.attachments.length > 0),
        attachment_count: sanitizedRequest.attachments?.length || 0,
        from_override: sanitizedRequest.from,
        reply_to: sanitizedRequest.reply_to,
        headers: sanitizedRequest.headers
      }
    };

    console.log('Creating email log entry...');
    const emailLog = await dbService.logEmail(emailLogData);

    // Prepare final email request
    const finalEmailRequest: EmailRequest = {
      ...sanitizedRequest,
      html: finalHtml,
      text: finalText
    };

    try {
      // Send email via Resend
      console.log('Sending email via Resend...');
      const result = await emailService.sendEmail(finalEmailRequest);

      // Update email log with success
      await dbService.updateEmailStatus(emailLog.id!, 'sent', {
        external_id: result.id,
        sent_at: new Date().toISOString(),
        provider: 'resend'
      });

      // Increment rate limit counter
      await dbService.incrementEmailCount(user.id);

      console.log(`Email sent successfully: ${result.id}`);

      const response: EmailResponse = {
        success: true,
        email_id: emailLog.id,
        external_id: result.id,
        message: 'Email sent successfully',
        rate_limit: {
          remaining: rateLimitResult.remaining - 1,
          reset_at: new Date(Date.now() + 60000).toISOString()
        }
      };

      return new Response(
        JSON.stringify(response),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );

    } catch (emailError) {
      console.error('Error sending email:', emailError);
      
      // Update email log with failure
      await dbService.updateEmailStatus(emailLog.id!, 'failed', {
        error_message: emailError instanceof Error ? emailError.message : String(emailError),
        failed_at: new Date().toISOString()
      });

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Failed to send email',
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
    console.error('Unexpected error in send-email function:', error);
    
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