-- Migration to fix authentication trigger and create missing profiles
-- Run this in your Supabase Dashboard SQL Editor

-- Step 1: Create or replace the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, first_name, last_name, avatar_url, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$;

-- Step 2: Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Create helper function to check if profiles exist for auth users
CREATE OR REPLACE FUNCTION public.get_users_without_profiles()
RETURNS TABLE(user_id uuid, user_email text, user_metadata jsonb)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id = p.id
  WHERE p.id IS NULL;
$$;

-- Step 4: Create function to manually create profiles for existing users
CREATE OR REPLACE FUNCTION public.create_missing_profiles()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  profiles_created INTEGER := 0;
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
    -- Create profile for this user
    INSERT INTO public.profiles (id, email, full_name, first_name, last_name, avatar_url, phone)
    VALUES (
      user_record.id,
      user_record.email,
      COALESCE(user_record.raw_user_meta_data->>'full_name', user_record.raw_user_meta_data->>'name', 'User'),
      user_record.raw_user_meta_data->>'first_name',
      user_record.raw_user_meta_data->>'last_name',
      user_record.raw_user_meta_data->>'avatar_url',
      user_record.raw_user_meta_data->>'phone'
    );
    
    profiles_created := profiles_created + 1;
  END LOOP;
  
  RETURN profiles_created;
END;
$$;

-- Step 5: Run the function to create missing profiles
SELECT public.create_missing_profiles() AS profiles_created;

-- Step 6: Verify the results
SELECT 
  COUNT(*) AS total_auth_users,
  (SELECT COUNT(*) FROM public.profiles) AS total_profiles,
  (SELECT COUNT(*) FROM auth.users au LEFT JOIN public.profiles p ON au.id = p.id WHERE p.id IS NULL) AS missing_profiles
FROM auth.users;

-- Step 7: Show sample of created profiles
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.first_name,
  p.last_name,
  p.created_at
FROM public.profiles p
ORDER BY p.created_at DESC
LIMIT 5;