-- Fix 500 error on user signup
-- This migration completely removes problematic triggers and functions
-- and sets up a clean auth flow

-- Step 1: Remove all existing auth triggers that might be causing issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;

-- Step 2: Remove any problematic functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Step 3: Ensure profiles table exists with correct structure
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email text,
    full_name text,
    first_name text,
    last_name text,
    avatar_url text,
    phone text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Step 4: Set up proper RLS policies for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create simple RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 5: Create a simple, safe function to create profiles manually
CREATE OR REPLACE FUNCTION public.create_user_profile(
    user_id uuid,
    user_email text,
    user_full_name text DEFAULT '',
    user_first_name text DEFAULT '',
    user_last_name text DEFAULT ''
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if profile already exists
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id) THEN
        RETURN true; -- Profile already exists
    END IF;
    
    -- Insert new profile
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        first_name,
        last_name
    ) VALUES (
        user_id,
        user_email,
        COALESCE(user_full_name, ''),
        COALESCE(user_first_name, ''),
        COALESCE(user_last_name, '')
    );
    
    RETURN true;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail
        RAISE LOG 'Failed to create profile for user %: %', user_id, SQLERRM;
        RETURN false;
END;
$$;

-- Step 6: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile TO anon, authenticated;

-- Step 7: Clean up any orphaned data that might cause conflicts
-- Remove any duplicate or invalid profile entries
DELETE FROM public.profiles WHERE id NOT IN (
    SELECT id FROM auth.users
);

-- Step 8: Show current state
SELECT 
    'Database cleanup completed' as status,
    COUNT(*) as total_auth_users,
    (SELECT COUNT(*) FROM public.profiles) as total_profiles
FROM auth.users;

COMMENT ON FUNCTION public.create_user_profile IS 'Manually create user profile - safe to call multiple times';