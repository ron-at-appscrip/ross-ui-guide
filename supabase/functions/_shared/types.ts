// Shared TypeScript types for email Edge Functions

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

export interface EmailLogEntry {
  id?: string;
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
  external_id?: string; // Resend email ID
  error_message?: string;
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  bounced_at?: string;
  complained_at?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
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

export interface RateLimitConfig {
  max_requests_per_minute: number;
  max_requests_per_hour: number;
  max_requests_per_day: number;
  rate_limit_key_prefix: string;
}

export interface EmailValidationError {
  field: string;
  message: string;
  code: string;
}

export interface EmailResponse {
  success: boolean;
  email_id?: string;
  external_id?: string;
  message?: string;
  errors?: EmailValidationError[];
  rate_limit?: {
    remaining: number;
    reset_at: string;
  };
}

export interface DatabaseConnection {
  supabaseUrl: string;
  supabaseServiceKey: string;
}

export interface ResendConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

// Communication tracking for activity logging
export interface CommunicationActivity {
  id?: string;
  client_id: string;
  matter_id?: string;
  activity_type: 'email' | 'phone' | 'meeting' | 'letter' | 'fax' | 'sms';
  direction: 'inbound' | 'outbound';
  subject: string;
  content?: string;
  summary?: string;
  participants: CommunicationParticipant[];
  date: string;
  time: string;
  duration?: string;
  billable: boolean;
  billable_hours?: number;
  hourly_rate?: number;
  status: 'draft' | 'sent' | 'received' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  attachments: CommunicationAttachment[];
  follow_up_required: boolean;
  follow_up_date?: string;
  follow_up_notes?: string;
  reminder_date?: string;
  created_by: string;
  metadata: Record<string, any>;
}

export interface CommunicationParticipant {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'client' | 'attorney' | 'staff' | 'opposing_counsel' | 'third_party';
  organization?: string;
}

export interface CommunicationAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}