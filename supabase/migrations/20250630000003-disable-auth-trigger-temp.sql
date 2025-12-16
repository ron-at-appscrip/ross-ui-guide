-- Temporary solution: Disable auth trigger for testing
-- Use this if you want to test basic Supabase auth without profile creation
-- WARNING: This means new users won't have profiles created automatically

-- Step 1: Disable the trigger temporarily
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Create a manual function to create profiles when needed
CREATE OR REPLACE FUNCTION public.create_profile_for_user(user_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
    split_result RECORD;
    user_full_name TEXT;
BEGIN
    -- Get user data
    SELECT id, email, raw_user_meta_data 
    INTO user_record
    FROM auth.users 
    WHERE id = user_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check if profile already exists
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id) THEN
        RETURN TRUE; -- Profile already exists
    END IF;
    
    -- Get the full name from user metadata
    user_full_name := COALESCE(
        user_record.raw_user_meta_data->>'full_name', 
        user_record.raw_user_meta_data->>'name', 
        'User'
    );
    
    -- Split the full name
    SELECT * INTO split_result FROM split_full_name(user_full_name);
    
    -- Create profile
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name, 
        first_name, 
        last_name, 
        avatar_url, 
        phone
    )
    VALUES (
        user_record.id,
        user_record.email,
        user_full_name,
        split_result.first_name,
        split_result.last_name,
        user_record.raw_user_meta_data->>'avatar_url',
        user_record.raw_user_meta_data->>'phone'
    );
    
    RETURN TRUE;
END;
$$;

-- Step 3: Create a function to re-enable the trigger later
CREATE OR REPLACE FUNCTION public.enable_auth_trigger()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Re-create the trigger
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    
    RETURN 'Auth trigger has been re-enabled';
END;
$$;

-- Step 4: Show instructions
SELECT 'Auth trigger has been disabled. New users can be created without profile errors.' as status;
SELECT 'To create a profile manually, use: SELECT public.create_profile_for_user(''user-uuid-here'');' as manual_profile_creation;
SELECT 'To re-enable the trigger, use: SELECT public.enable_auth_trigger();' as re_enable_trigger;