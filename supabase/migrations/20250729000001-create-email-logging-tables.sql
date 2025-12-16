-- Migration: Create email logging and template tables for Edge Functions
-- This migration creates tables for email logging, templates, and communication tracking

-- Create email_logs table for tracking all email sends
CREATE TABLE public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  matter_id UUID REFERENCES public.matters(id) ON DELETE SET NULL,
  
  -- Email classification
  email_type TEXT NOT NULL CHECK (email_type IN ('general', 'invoice', 'communication', 'notification', 'marketing')),
  
  -- Email addresses (using arrays for multiple recipients)
  to_addresses TEXT[] NOT NULL,
  cc_addresses TEXT[],
  bcc_addresses TEXT[],
  
  -- Email content
  subject TEXT NOT NULL,
  content TEXT,
  template_id UUID,
  template_variables JSONB,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'bounced', 'failed', 'complained')),
  external_id TEXT, -- Resend email ID
  error_message TEXT,
  
  -- Timestamp tracking
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  complained_at TIMESTAMP WITH TIME ZONE,
  
  -- Additional metadata
  metadata JSONB,
  
  -- Standard timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  PRIMARY KEY (id)
);

-- Create email_templates table for reusable email templates
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables TEXT[], -- Array of variable names used in template
  category TEXT NOT NULL CHECK (category IN ('invoice', 'communication', 'notification', 'marketing', 'system')),
  is_active BOOLEAN DEFAULT true,
  
  -- Standard timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  PRIMARY KEY (id)
);

-- Create matters table if it doesn't exist (referenced by email_logs)
CREATE TABLE IF NOT EXISTS public.matters (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  practice_area TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed', 'archived')),
  billing_preference JSONB,
  
  -- Standard timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  PRIMARY KEY (id)
);

-- Enable RLS on all tables
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matters ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for email_logs
CREATE POLICY "Users can view own email logs" ON public.email_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email logs" ON public.email_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own email logs" ON public.email_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own email logs" ON public.email_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for email_templates (global read, user write)
CREATE POLICY "Anyone can view active email templates" ON public.email_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage email templates" ON public.email_templates
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Create RLS policies for matters
CREATE POLICY "Users can view own matters" ON public.matters
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own matters" ON public.matters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own matters" ON public.matters
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own matters" ON public.matters
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_email_logs_user_id ON public.email_logs(user_id);
CREATE INDEX idx_email_logs_client_id ON public.email_logs(client_id);
CREATE INDEX idx_email_logs_matter_id ON public.email_logs(matter_id);
CREATE INDEX idx_email_logs_email_type ON public.email_logs(email_type);
CREATE INDEX idx_email_logs_status ON public.email_logs(status);
CREATE INDEX idx_email_logs_external_id ON public.email_logs(external_id);
CREATE INDEX idx_email_logs_sent_at ON public.email_logs(sent_at);
CREATE INDEX idx_email_logs_created_at ON public.email_logs(created_at);

CREATE INDEX idx_email_templates_category ON public.email_templates(category);
CREATE INDEX idx_email_templates_is_active ON public.email_templates(is_active);
CREATE INDEX idx_email_templates_name ON public.email_templates(name);

CREATE INDEX idx_matters_user_id ON public.matters(user_id);
CREATE INDEX idx_matters_client_id ON public.matters(client_id);
CREATE INDEX idx_matters_status ON public.matters(status);
CREATE INDEX idx_matters_practice_area ON public.matters(practice_area);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_email_logs_updated_at BEFORE UPDATE ON public.email_logs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON public.email_templates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_matters_updated_at BEFORE UPDATE ON public.matters
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default email templates
INSERT INTO public.email_templates (name, subject, html_content, text_content, variables, category) VALUES
('Invoice Email Template', 'Invoice {{invoice_number}} - Payment Due {{due_date}}', 
'<!DOCTYPE html>
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
            <p><strong>Matter:</strong> {{matter_title}}</p>
            <div style="margin: 20px 0;">
                <p><strong>Amount Due:</strong> <span class="amount">${{amount_due}}</span></p>
            </div>
        </div>
        <div class="footer">
            <p>If you have any questions about this invoice, please don''t hesitate to contact us.</p>
            <p>Thank you for your business.</p>
            <p><strong>{{firm_name}}</strong></p>
        </div>
    </div>
</body>
</html>',
'Invoice {{invoice_number}}

Dear {{client_name}},

Please find your invoice details below. Payment is due by {{due_date}}.

Invoice Number: {{invoice_number}}
Invoice Date: {{invoice_date}}
Due Date: {{due_date}}
Matter: {{matter_title}}
Amount Due: ${{amount_due}}

If you have any questions about this invoice, please don''t hesitate to contact us.

Thank you for your business.

{{firm_name}}',
ARRAY['client_name', 'invoice_number', 'invoice_date', 'due_date', 'matter_title', 'amount_due', 'firm_name'],
'invoice'),

('Status Update Template', 'Status Update: {{matter_title}}',
'<!DOCTYPE html>
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
            <p>If you have any questions, please don''t hesitate to contact us.</p>
            <p><strong>{{attorney_name}}</strong><br>{{firm_name}}</p>
        </div>
    </div>
</body>
</html>',
'Status Update: {{matter_title}}

Dear {{client_name}},

{{content}}

If you have any questions, please don''t hesitate to contact us.

{{attorney_name}}
{{firm_name}}',
ARRAY['client_name', 'matter_title', 'content', 'attorney_name', 'firm_name'],
'communication'),

('Meeting Confirmation Template', 'Meeting Confirmation: {{meeting_date}}',
'<!DOCTYPE html>
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
            <p><strong>Matter:</strong> {{matter_title}}</p>
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
</html>',
'Meeting Confirmation: {{meeting_date}}

Dear {{client_name}},

This confirms our upcoming meeting scheduled for:

Date: {{meeting_date}}
Time: {{meeting_time}}
Location/Platform: {{meeting_location}}
Matter: {{matter_title}}

{{content}}

Please let us know if you need to reschedule or have any questions.

{{attorney_name}}
{{firm_name}}',
ARRAY['client_name', 'meeting_date', 'meeting_time', 'meeting_location', 'matter_title', 'content', 'attorney_name', 'firm_name'],
'communication');

-- Create function to get email statistics
CREATE OR REPLACE FUNCTION public.get_email_statistics(
  user_id_param UUID,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  total_sent INTEGER;
  total_delivered INTEGER;
  total_bounced INTEGER;
  total_failed INTEGER;
  delivery_rate DECIMAL;
  bounce_rate DECIMAL;
BEGIN
  -- Set default date range (last 30 days) if not provided
  IF start_date IS NULL THEN
    start_date := NOW() - INTERVAL '30 days';
  END IF;
  
  IF end_date IS NULL THEN
    end_date := NOW();
  END IF;

  -- Calculate statistics
  SELECT 
    COUNT(*) FILTER (WHERE status = 'sent') AS sent,
    COUNT(*) FILTER (WHERE status = 'delivered') AS delivered,
    COUNT(*) FILTER (WHERE status = 'bounced') AS bounced,
    COUNT(*) FILTER (WHERE status = 'failed') AS failed
  INTO total_sent, total_delivered, total_bounced, total_failed
  FROM public.email_logs
  WHERE user_id = user_id_param
    AND created_at BETWEEN start_date AND end_date;

  -- Calculate rates
  IF total_sent > 0 THEN
    delivery_rate := ROUND((total_delivered::DECIMAL / total_sent::DECIMAL) * 100, 2);
    bounce_rate := ROUND((total_bounced::DECIMAL / total_sent::DECIMAL) * 100, 2);
  ELSE
    delivery_rate := 0;
    bounce_rate := 0;
  END IF;

  -- Build result JSON
  result := jsonb_build_object(
    'total_sent', total_sent,
    'total_delivered', total_delivered,
    'total_bounced', total_bounced,
    'total_failed', total_failed,
    'delivery_rate', delivery_rate,
    'bounce_rate', bounce_rate,
    'period_start', start_date,
    'period_end', end_date
  );

  RETURN result;
END;
$$;