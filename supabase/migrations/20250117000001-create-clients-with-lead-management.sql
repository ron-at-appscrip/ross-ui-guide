-- Migration: Create clients table with comprehensive lead management system
-- This migration creates the clients table and all lead management infrastructure

-- Create clients table with lead management fields
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic client information
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  client_type TEXT NOT NULL DEFAULT 'person' CHECK (client_type IN ('person', 'company')),
  
  -- Address information
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'US',
  
  -- Company specific fields
  company_name TEXT,
  industry TEXT,
  
  -- Profile and status
  profile_photo_url TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  
  -- Lead management fields
  lead_source TEXT,
  lead_status TEXT NOT NULL DEFAULT 'prospect' CHECK (lead_status IN ('prospect', 'qualified', 'consultation', 'proposal', 'converted', 'lost')),
  lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  intake_stage TEXT NOT NULL DEFAULT 'initial' CHECK (intake_stage IN ('initial', 'qualification', 'conflict_check', 'consultation', 'proposal', 'onboarding', 'completed')),
  
  -- Lead tracking dates
  qualified_date TIMESTAMP WITH TIME ZONE,
  consultation_date TIMESTAMP WITH TIME ZONE,
  conversion_date TIMESTAMP WITH TIME ZONE,
  
  -- Assignment and routing
  assigned_attorney_id UUID REFERENCES auth.users(id),
  referral_source TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  PRIMARY KEY (id)
);

-- Create lead sources lookup table
CREATE TABLE public.lead_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('referral', 'marketing', 'organic', 'advertising', 'networking', 'social_media', 'other')),
  description TEXT,
  tracking_code TEXT, -- For UTM tracking, etc.
  cost_per_lead DECIMAL(10,2), -- For ROI calculation
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  PRIMARY KEY (id),
  UNIQUE(name)
);

-- Create lead activities tracking table
CREATE TABLE public.lead_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('contact', 'email', 'call', 'meeting', 'document', 'note', 'task', 'follow_up')),
  title TEXT NOT NULL,
  description TEXT,
  
  -- Scheduling
  scheduled_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  
  -- Status and priority
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  
  -- Metadata
  metadata JSONB, -- For storing activity-specific data
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  PRIMARY KEY (id)
);

-- Create intake workflow templates table
CREATE TABLE public.intake_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  practice_area TEXT, -- 'family', 'corporate', 'litigation', 'employment', etc.
  client_type TEXT CHECK (client_type IN ('person', 'company', 'both')),
  
  -- Workflow configuration
  stages JSONB NOT NULL, -- Array of stage configurations
  automation_rules JSONB, -- Automation rules for stage transitions
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  PRIMARY KEY (id)
);

-- Create conflict checks table
CREATE TABLE public.conflict_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  
  -- Check details
  check_type TEXT NOT NULL CHECK (check_type IN ('automatic', 'manual', 'external')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'clear', 'conflict_found', 'requires_review')),
  
  -- Results
  conflict_details TEXT,
  resolution_notes TEXT,
  
  -- Processing
  checked_by UUID REFERENCES auth.users(id),
  checked_date TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  PRIMARY KEY (id)
);

-- Enable RLS on all tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intake_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conflict_checks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clients
CREATE POLICY "Users can view own clients" ON public.clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients" ON public.clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" ON public.clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients" ON public.clients
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for lead_sources (global read, admin write)
CREATE POLICY "Anyone can view lead sources" ON public.lead_sources
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage lead sources" ON public.lead_sources
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Create RLS policies for lead_activities
CREATE POLICY "Users can view activities for own clients" ON public.lead_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clients 
      WHERE clients.id = lead_activities.lead_id 
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert activities for own clients" ON public.lead_activities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients 
      WHERE clients.id = lead_activities.lead_id 
      AND clients.user_id = auth.uid()
    )
    AND auth.uid() = created_by
  );

CREATE POLICY "Users can update activities for own clients" ON public.lead_activities
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.clients 
      WHERE clients.id = lead_activities.lead_id 
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete activities for own clients" ON public.lead_activities
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.clients 
      WHERE clients.id = lead_activities.lead_id 
      AND clients.user_id = auth.uid()
    )
  );

-- Create RLS policies for intake_workflows
CREATE POLICY "Anyone can view intake workflows" ON public.intake_workflows
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage intake workflows" ON public.intake_workflows
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Create RLS policies for conflict_checks
CREATE POLICY "Users can view conflict checks for own clients" ON public.conflict_checks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clients 
      WHERE clients.id = conflict_checks.client_id 
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert conflict checks for own clients" ON public.conflict_checks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients 
      WHERE clients.id = conflict_checks.client_id 
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update conflict checks for own clients" ON public.conflict_checks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.clients 
      WHERE clients.id = conflict_checks.client_id 
      AND clients.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_clients_lead_status ON public.clients(lead_status);
CREATE INDEX idx_clients_intake_stage ON public.clients(intake_stage);
CREATE INDEX idx_clients_lead_source ON public.clients(lead_source);
CREATE INDEX idx_clients_assigned_attorney ON public.clients(assigned_attorney_id);
CREATE INDEX idx_clients_created_at ON public.clients(created_at);
CREATE INDEX idx_clients_email ON public.clients(email);
CREATE INDEX idx_clients_phone ON public.clients(phone);

CREATE INDEX idx_lead_activities_lead_id ON public.lead_activities(lead_id);
CREATE INDEX idx_lead_activities_activity_type ON public.lead_activities(activity_type);
CREATE INDEX idx_lead_activities_status ON public.lead_activities(status);
CREATE INDEX idx_lead_activities_assigned_to ON public.lead_activities(assigned_to);
CREATE INDEX idx_lead_activities_scheduled_date ON public.lead_activities(scheduled_date);
CREATE INDEX idx_lead_activities_due_date ON public.lead_activities(due_date);

CREATE INDEX idx_conflict_checks_client_id ON public.conflict_checks(client_id);
CREATE INDEX idx_conflict_checks_status ON public.conflict_checks(status);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lead_sources_updated_at BEFORE UPDATE ON public.lead_sources
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lead_activities_updated_at BEFORE UPDATE ON public.lead_activities
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_intake_workflows_updated_at BEFORE UPDATE ON public.intake_workflows
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conflict_checks_updated_at BEFORE UPDATE ON public.conflict_checks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default lead sources
INSERT INTO public.lead_sources (name, category, description) VALUES
('Website Contact Form', 'organic', 'Leads from website contact form submissions'),
('Phone Inquiry', 'organic', 'Direct phone calls to the office'),
('Referral - Client', 'referral', 'Referrals from existing clients'),
('Referral - Attorney', 'referral', 'Referrals from other attorneys'),
('Google Ads', 'advertising', 'Leads from Google Ads campaigns'),
('Social Media', 'social_media', 'Leads from social media platforms'),
('Networking Events', 'networking', 'Leads from professional networking events'),
('Email Marketing', 'marketing', 'Leads from email marketing campaigns'),
('LinkedIn', 'social_media', 'Leads from LinkedIn outreach'),
('Print Advertising', 'advertising', 'Leads from print advertisements'),
('Direct Mail', 'marketing', 'Leads from direct mail campaigns'),
('Trade Shows', 'networking', 'Leads from trade show participation'),
('Online Reviews', 'organic', 'Leads from online review platforms'),
('Webinars', 'marketing', 'Leads from webinar attendance'),
('Content Marketing', 'marketing', 'Leads from blog posts and content');

-- Insert default intake workflow for general practice
INSERT INTO public.intake_workflows (name, description, practice_area, client_type, stages, is_default) VALUES
('General Practice Workflow', 'Standard intake workflow for general practice clients', 'general', 'both', 
'[
  {
    "id": "initial",
    "name": "Initial Contact",
    "description": "Lead captured and initial information gathered",
    "required_fields": ["name", "email", "phone"],
    "auto_advance": false
  },
  {
    "id": "qualification",
    "name": "Qualification",
    "description": "Pre-screening and lead scoring",
    "required_fields": ["lead_score", "matter_type"],
    "auto_advance": false
  },
  {
    "id": "conflict_check",
    "name": "Conflict Check",
    "description": "Conflict of interest verification",
    "required_fields": ["conflict_check_status"],
    "auto_advance": true
  },
  {
    "id": "consultation",
    "name": "Consultation",
    "description": "Initial consultation scheduled and completed",
    "required_fields": ["consultation_date", "consultation_notes"],
    "auto_advance": false
  },
  {
    "id": "proposal",
    "name": "Proposal",
    "description": "Fee agreement and engagement letter prepared",
    "required_fields": ["fee_agreement", "engagement_letter"],
    "auto_advance": false
  },
  {
    "id": "onboarding",
    "name": "Client Onboarding",
    "description": "Client setup and matter creation",
    "required_fields": ["client_portal_access", "matter_created"],
    "auto_advance": false
  },
  {
    "id": "completed",
    "name": "Completed",
    "description": "Intake process completed successfully",
    "required_fields": [],
    "auto_advance": true
  }
]', true);

-- Create function to auto-advance intake stages
CREATE OR REPLACE FUNCTION public.advance_intake_stage()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Auto-advance from conflict_check to consultation if conflict check is clear
  IF NEW.intake_stage = 'conflict_check' AND 
     EXISTS (
       SELECT 1 FROM public.conflict_checks 
       WHERE client_id = NEW.id AND status = 'clear'
     ) THEN
    NEW.intake_stage = 'consultation';
  END IF;
  
  -- Auto-advance to completed stage when converted
  IF NEW.lead_status = 'converted' AND NEW.intake_stage != 'completed' THEN
    NEW.intake_stage = 'completed';
    NEW.conversion_date = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto-advancing intake stages
CREATE TRIGGER auto_advance_intake_stage
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.advance_intake_stage();

-- Create function for lead scoring
CREATE OR REPLACE FUNCTION public.calculate_lead_score(
  client_id UUID,
  matter_urgency INTEGER DEFAULT 50,
  budget_range INTEGER DEFAULT 50,
  referral_quality INTEGER DEFAULT 50,
  response_time INTEGER DEFAULT 50
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  base_score INTEGER := 0;
  source_multiplier DECIMAL := 1.0;
  lead_source_name TEXT;
BEGIN
  -- Get lead source
  SELECT lead_source INTO lead_source_name
  FROM public.clients
  WHERE id = client_id;
  
  -- Calculate base score from input factors
  base_score := (matter_urgency + budget_range + referral_quality + response_time) / 4;
  
  -- Apply source multiplier
  source_multiplier := CASE 
    WHEN lead_source_name IN ('Referral - Client', 'Referral - Attorney') THEN 1.2
    WHEN lead_source_name IN ('Website Contact Form', 'Phone Inquiry') THEN 1.1
    WHEN lead_source_name IN ('Google Ads', 'Social Media') THEN 1.0
    WHEN lead_source_name IN ('Email Marketing', 'Content Marketing') THEN 0.9
    ELSE 1.0
  END;
  
  -- Return final score (capped at 100)
  RETURN LEAST(100, ROUND(base_score * source_multiplier));
END;
$$;

-- Create RPC function for creating user profile safely
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id UUID,
  user_email TEXT,
  user_full_name TEXT,
  user_first_name TEXT DEFAULT NULL,
  user_last_name TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, first_name, last_name)
  VALUES (user_id, user_email, user_full_name, user_first_name, user_last_name)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    updated_at = NOW();
END;
$$;