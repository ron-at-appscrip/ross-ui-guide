-- Phone Number Enhancements Migration
-- This migration adds phone number field to profiles table and ensures wizard_data can handle international phone numbers

-- Add phone number field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN phone TEXT;

-- Add phone number to user creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$;

-- Create function to validate phone numbers in E.164 format
CREATE OR REPLACE FUNCTION public.is_valid_phone_number(phone_number TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if phone number is in E.164 format (+[country code][number])
  -- E.164 format: + followed by up to 15 digits
  RETURN phone_number ~ '^\+[1-9]\d{1,14}$';
END;
$$;

-- Add check constraint for phone number format (optional, can be null)
ALTER TABLE public.profiles 
ADD CONSTRAINT valid_phone_format 
CHECK (phone IS NULL OR is_valid_phone_number(phone));

-- Create index for phone number lookups
CREATE INDEX idx_profiles_phone ON public.profiles(phone) WHERE phone IS NOT NULL;

-- Create function to extract phone data from wizard_data for search
CREATE OR REPLACE FUNCTION public.get_user_phone_from_wizard(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  phone_data JSONB;
  phone_number TEXT;
BEGIN
  SELECT data INTO phone_data
  FROM public.wizard_data
  WHERE user_id = get_user_phone_from_wizard.user_id 
    AND step_key = 'personal'
  LIMIT 1;
  
  IF phone_data IS NOT NULL THEN
    phone_number := phone_data->>'phone';
    RETURN phone_number;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Create view for easy phone number access
CREATE VIEW public.user_phone_numbers AS
SELECT 
  p.id,
  p.email,
  p.full_name,
  COALESCE(p.phone, public.get_user_phone_from_wizard(p.id)) as phone_number,
  p.created_at,
  p.updated_at
FROM public.profiles p;

-- Enable RLS on the view
ALTER VIEW public.user_phone_numbers SET (security_invoker = true);

-- Grant access to the view
GRANT SELECT ON public.user_phone_numbers TO authenticated;

-- Create policy for the view
CREATE POLICY "Users can view own phone data" ON public.user_phone_numbers
  FOR SELECT USING (auth.uid() = id);

-- Add comment explaining the phone number storage strategy
COMMENT ON COLUMN public.profiles.phone IS 'Phone number in E.164 format (e.g., +1234567890). Can be null.';
COMMENT ON FUNCTION public.is_valid_phone_number IS 'Validates phone numbers in E.164 international format';
COMMENT ON VIEW public.user_phone_numbers IS 'Unified view of user phone numbers from both profiles and wizard_data tables';