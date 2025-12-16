// Input validation schemas and functions for email Edge Functions

import { EmailRequest, InvoiceEmailRequest, ClientCommunicationRequest, EmailValidationError } from './types.ts';

export function validateEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

export function validateEmailArray(emails: string[]): string[] {
  return emails.filter(email => {
    const trimmed = email.trim();
    return trimmed.length > 0 && validateEmail(trimmed);
  });
}

export function validateEmailRequest(request: EmailRequest): EmailValidationError[] {
  const errors: EmailValidationError[] = [];

  // Validate required fields
  if (!request.to || !Array.isArray(request.to) || request.to.length === 0) {
    errors.push({
      field: 'to',
      message: 'At least one recipient email address is required',
      code: 'REQUIRED_FIELD'
    });
  } else {
    const validTo = validateEmailArray(request.to);
    if (validTo.length === 0) {
      errors.push({
        field: 'to',
        message: 'At least one valid recipient email address is required',
        code: 'INVALID_EMAIL'
      });
    } else if (validTo.length !== request.to.length) {
      errors.push({
        field: 'to',
        message: 'Some recipient email addresses are invalid',
        code: 'INVALID_EMAIL'
      });
    }
  }

  if (!request.subject || request.subject.trim().length === 0) {
    errors.push({
      field: 'subject',
      message: 'Email subject is required',
      code: 'REQUIRED_FIELD'
    });
  } else if (request.subject.length > 255) {
    errors.push({
      field: 'subject',
      message: 'Email subject must be 255 characters or less',
      code: 'MAX_LENGTH_EXCEEDED'
    });
  }

  if (!request.html && !request.text && !request.template_id) {
    errors.push({
      field: 'content',
      message: 'Email must have HTML content, text content, or template ID',
      code: 'REQUIRED_FIELD'
    });
  }

  // Validate optional email arrays
  if (request.cc && request.cc.length > 0) {
    const validCc = validateEmailArray(request.cc);
    if (validCc.length !== request.cc.length) {
      errors.push({
        field: 'cc',
        message: 'Some CC email addresses are invalid',
        code: 'INVALID_EMAIL'
      });
    }
  }

  if (request.bcc && request.bcc.length > 0) {
    const validBcc = validateEmailArray(request.bcc);
    if (validBcc.length !== request.bcc.length) {
      errors.push({
        field: 'bcc',
        message: 'Some BCC email addresses are invalid',
        code: 'INVALID_EMAIL'
      });
    }
  }

  // Validate reply_to if provided
  if (request.reply_to && !validateEmail(request.reply_to)) {
    errors.push({
      field: 'reply_to',
      message: 'Reply-to email address is invalid',
      code: 'INVALID_EMAIL'
    });
  }

  // Validate from if provided
  if (request.from && !validateEmail(request.from)) {
    errors.push({
      field: 'from',
      message: 'From email address is invalid',
      code: 'INVALID_EMAIL'
    });
  }

  // Validate priority
  if (request.priority && !['low', 'normal', 'high'].includes(request.priority)) {
    errors.push({
      field: 'priority',
      message: 'Priority must be low, normal, or high',
      code: 'INVALID_VALUE'
    });
  }

  // Validate attachments
  if (request.attachments) {
    for (let i = 0; i < request.attachments.length; i++) {
      const attachment = request.attachments[i];
      
      if (!attachment.filename || attachment.filename.trim().length === 0) {
        errors.push({
          field: `attachments[${i}].filename`,
          message: 'Attachment filename is required',
          code: 'REQUIRED_FIELD'
        });
      }

      if (!attachment.content || attachment.content.trim().length === 0) {
        errors.push({
          field: `attachments[${i}].content`,
          message: 'Attachment content is required',
          code: 'REQUIRED_FIELD'
        });
      }

      if (!attachment.contentType || attachment.contentType.trim().length === 0) {
        errors.push({
          field: `attachments[${i}].contentType`,
          message: 'Attachment content type is required',
          code: 'REQUIRED_FIELD'
        });
      }

      // Check attachment size (10MB limit)
      if (attachment.size && attachment.size > 10 * 1024 * 1024) {
        errors.push({
          field: `attachments[${i}].size`,
          message: 'Attachment size cannot exceed 10MB',
          code: 'SIZE_LIMIT_EXCEEDED'
        });
      }
    }

    // Check total attachments count (max 20)
    if (request.attachments.length > 20) {
      errors.push({
        field: 'attachments',
        message: 'Cannot have more than 20 attachments',
        code: 'COUNT_LIMIT_EXCEEDED'
      });
    }
  }

  return errors;
}

export function validateInvoiceEmailRequest(request: InvoiceEmailRequest): EmailValidationError[] {
  const baseErrors = validateEmailRequest(request);

  if (!request.invoice_id || request.invoice_id.trim().length === 0) {
    baseErrors.push({
      field: 'invoice_id',
      message: 'Invoice ID is required',
      code: 'REQUIRED_FIELD'
    });
  }

  if (!request.client_id || request.client_id.trim().length === 0) {
    baseErrors.push({
      field: 'client_id',
      message: 'Client ID is required',
      code: 'REQUIRED_FIELD'
    });
  }

  if (!request.invoice_number || request.invoice_number.trim().length === 0) {
    baseErrors.push({
      field: 'invoice_number',
      message: 'Invoice number is required',
      code: 'REQUIRED_FIELD'
    });
  }

  if (request.amount_due === undefined || request.amount_due === null) {
    baseErrors.push({
      field: 'amount_due',
      message: 'Amount due is required',
      code: 'REQUIRED_FIELD'
    });
  } else if (typeof request.amount_due !== 'number' || request.amount_due < 0) {
    baseErrors.push({
      field: 'amount_due',
      message: 'Amount due must be a non-negative number',
      code: 'INVALID_VALUE'
    });
  }

  if (!request.due_date || request.due_date.trim().length === 0) {
    baseErrors.push({
      field: 'due_date',
      message: 'Due date is required',
      code: 'REQUIRED_FIELD'
    });
  } else {
    const dueDate = new Date(request.due_date);
    if (isNaN(dueDate.getTime())) {
      baseErrors.push({
        field: 'due_date',
        message: 'Due date must be a valid ISO date string',
        code: 'INVALID_DATE'
      });
    }
  }

  return baseErrors;
}

export function validateClientCommunicationRequest(request: ClientCommunicationRequest): EmailValidationError[] {
  const baseErrors = validateEmailRequest(request);

  if (!request.client_id || request.client_id.trim().length === 0) {
    baseErrors.push({
      field: 'client_id',
      message: 'Client ID is required',
      code: 'REQUIRED_FIELD'
    });
  }

  const validCommunicationTypes = ['status_update', 'meeting_confirmation', 'document_request', 'general', 'billing'];
  if (!request.communication_type || !validCommunicationTypes.includes(request.communication_type)) {
    baseErrors.push({
      field: 'communication_type',
      message: 'Communication type must be one of: ' + validCommunicationTypes.join(', '),
      code: 'INVALID_VALUE'
    });
  }

  const validActivityTypes = ['email', 'phone', 'meeting', 'letter', 'fax', 'sms'];
  if (request.activity_type && !validActivityTypes.includes(request.activity_type)) {
    baseErrors.push({
      field: 'activity_type',
      message: 'Activity type must be one of: ' + validActivityTypes.join(', '),
      code: 'INVALID_VALUE'
    });
  }

  if (request.billable_hours !== undefined && request.billable_hours !== null) {
    if (typeof request.billable_hours !== 'number' || request.billable_hours < 0) {
      baseErrors.push({
        field: 'billable_hours',
        message: 'Billable hours must be a non-negative number',
        code: 'INVALID_VALUE'
      });
    }
  }

  if (request.follow_up_date) {
    const followUpDate = new Date(request.follow_up_date);
    if (isNaN(followUpDate.getTime())) {
      baseErrors.push({
        field: 'follow_up_date',
        message: 'Follow-up date must be a valid ISO date string',
        code: 'INVALID_DATE'
      });
    }
  }

  return baseErrors;
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function sanitizeEmailRequest(request: EmailRequest): EmailRequest {
  return {
    ...request,
    to: request.to.map(email => email.trim().toLowerCase()),
    cc: request.cc?.map(email => email.trim().toLowerCase()),
    bcc: request.bcc?.map(email => email.trim().toLowerCase()),
    subject: sanitizeInput(request.subject),
    reply_to: request.reply_to?.trim().toLowerCase(),
    from: request.from?.trim().toLowerCase(),
    tags: request.tags?.map(tag => sanitizeInput(tag))
  };
}

export function checkRateLimit(
  identifier: string, 
  limits: { 
    perMinute: number; 
    perHour: number; 
    perDay: number 
  }
): { 
  allowed: boolean; 
  remaining: number; 
  resetAt: Date 
} {
  // In a real implementation, this would use Redis or similar for distributed rate limiting
  // For now, return a mock response that allows requests
  return {
    allowed: true,
    remaining: limits.perMinute - 1,
    resetAt: new Date(Date.now() + 60000) // 1 minute from now
  };
}