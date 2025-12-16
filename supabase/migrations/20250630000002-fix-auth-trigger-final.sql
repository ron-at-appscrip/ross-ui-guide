-- Final fix for authentication trigger issues
-- This migration ensures the handle_new_user function matches the current profiles table schema

-- Step 1: First, let's ensure all required columns exist in profiles table
-- (This is safe to run even if columns already exist)
DO $$
BEGIN
    -- Add first_name if it doesn't exist
    BEGIN
        ALTER TABLE public.profiles ADD COLUMN first_name TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
    
    -- Add last_name if it doesn't exist
    BEGIN
        ALTER TABLE public.profiles ADD COLUMN last_name TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
    
    -- Add phone if it doesn't exist
    BEGIN
        ALTER TABLE public.profiles ADD COLUMN phone TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
END $$;

-- Step 2: Create or replace the split_full_name function (needed for name splitting)
CREATE OR REPLACE FUNCTION split_full_name(full_name_input TEXT, OUT first_name TEXT, OUT last_name TEXT)
LANGUAGE plpgsql
AS $$
DECLARE
    name_parts TEXT[];
    parts_count INTEGER;
BEGIN
    -- Handle null or empty input
    IF full_name_input IS NULL OR TRIM(full_name_input) = '' THEN
        first_name := '';
        last_name := '';
        RETURN;
    END IF;
    
    -- Split the name by spaces and filter out empty strings
    SELECT ARRAY(
        SELECT TRIM(part) 
        FROM unnest(string_to_array(full_name_input, ' ')) AS part 
        WHERE TRIM(part) != ''
    ) INTO name_parts;
    
    parts_count := array_length(name_parts, 1);
    
    -- Handle different cases
    IF parts_count IS NULL OR parts_count = 0 THEN
        first_name := '';
        last_name := '';
    ELSIF parts_count = 1 THEN
        first_name := name_parts[1];
        last_name := '';
    ELSIF parts_count = 2 THEN
        first_name := name_parts[1];
        last_name := name_parts[2];
    ELSE
        -- For names with more than 2 parts, take first as first_name and join rest as last_name
        first_name := name_parts[1];
        last_name := array_to_string(name_parts[2:], ' ');
    END IF;
END;
$$;

-- Step 3: Create the corrected handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    split_result RECORD;
    user_full_name TEXT;
BEGIN
    -- Get the full name from user metadata
    user_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name', 
        NEW.raw_user_meta_data->>'name', 
        'User'
    );
    
    -- Split the full name into first and last names
    SELECT * INTO split_result FROM split_full_name(user_full_name);
    
    -- Insert the new profile with error handling
    BEGIN
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
            NEW.id,
            NEW.email,
            user_full_name,
            split_result.first_name,
            split_result.last_name,
            NEW.raw_user_meta_data->>'avatar_url',
            NEW.raw_user_meta_data->>'phone'
        );
    EXCEPTION
        WHEN OTHERS THEN
            -- Log the error and re-raise with more context
            RAISE EXCEPTION 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    END;
    
    RETURN NEW;
END;
$$;

-- Step 4: Drop and recreate the trigger to ensure it's using the new function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Create a function to test the trigger without creating a real user
CREATE OR REPLACE FUNCTION public.test_auth_trigger()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    test_result TEXT;
BEGIN
    -- This function helps test if the trigger would work
    -- by checking the profiles table structure
    
    SELECT string_agg(column_name, ', ' ORDER BY ordinal_position) INTO test_result
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles';
    
    RETURN 'Profiles table columns: ' || test_result;
END;
$$;

-- Step 6: Run the test function to verify table structure
SELECT public.test_auth_trigger() as table_structure_check;

-- Step 7: Create a function to safely create missing profiles for existing users
CREATE OR REPLACE FUNCTION public.create_missing_profiles_safe()
RETURNS TABLE(
    user_id uuid,
    email text,
    status text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
    split_result RECORD;
    user_full_name TEXT;
BEGIN
    -- Loop through users without profiles
    FOR user_record IN 
        SELECT 
            au.id,
            au.email,
            au.raw_user_meta_data
        FROM auth.users au
        LEFT JOIN public.profiles p ON au.id = p.id
        WHERE p.id IS NULL
    LOOP
        BEGIN
            -- Get the full name from user metadata
            user_full_name := COALESCE(
                user_record.raw_user_meta_data->>'full_name', 
                user_record.raw_user_meta_data->>'name', 
                'User'
            );
            
            -- Split the full name
            SELECT * INTO split_result FROM split_full_name(user_full_name);
            
            -- Create profile for this user
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
            
            -- Return success status
            user_id := user_record.id;
            email := user_record.email;
            status := 'Profile created successfully';
            RETURN NEXT;
            
        EXCEPTION
            WHEN OTHERS THEN
                -- Return error status
                user_id := user_record.id;
                email := user_record.email;
                status := 'Error: ' || SQLERRM;
                RETURN NEXT;
        END;
    END LOOP;
END;
$$;

-- Step 8: Show current state
SELECT 
    'Current state check:' as info,
    COUNT(*) AS total_auth_users,
    (SELECT COUNT(*) FROM public.profiles) AS total_profiles,
    (SELECT COUNT(*) FROM auth.users au LEFT JOIN public.profiles p ON au.id = p.id WHERE p.id IS NULL) AS missing_profiles
FROM auth.users;