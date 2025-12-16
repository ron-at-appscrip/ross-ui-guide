# 🚀 Migration Instructions for First/Last Name Split

Since the MCP tools aren't available in this session, please follow these steps to run the migration:

## Option 1: Supabase Dashboard (Recommended)

1. **Open Supabase SQL Editor**:
   https://supabase.com/dashboard/project/aiveyvvhlfiqhbaqazrr/sql/new

2. **Copy the migration SQL below and paste it into the SQL editor**:

```sql
-- Migration: Split full_name into first_name and last_name
-- This migration adds separate first_name and last_name columns to the profiles table
-- and creates a function to split existing full_name data

-- Add new columns for first_name and last_name
ALTER TABLE public.profiles 
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT;

-- Create a function to split full names
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

-- Migrate existing data: split full_name into first_name and last_name
UPDATE public.profiles 
SET 
    first_name = split_result.first_name,
    last_name = split_result.last_name
FROM (
    SELECT 
        id,
        (split_full_name(full_name)).first_name,
        (split_full_name(full_name)).last_name
    FROM public.profiles
) AS split_result
WHERE profiles.id = split_result.id;

-- Update the handle_new_user function to handle first_name and last_name
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
    
    -- Split the full name
    SELECT * INTO split_result FROM split_full_name(user_full_name);
    
    INSERT INTO public.profiles (id, email, full_name, first_name, last_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        user_full_name,
        split_result.first_name,
        split_result.last_name,
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$;

-- Add indexes for better performance on name searches
CREATE INDEX IF NOT EXISTS idx_profiles_first_name ON public.profiles(first_name);
CREATE INDEX IF NOT EXISTS idx_profiles_last_name ON public.profiles(last_name);

-- Add a computed column for backwards compatibility (optional)
-- This creates a view-like computed full name from first + last
ALTER TABLE public.profiles 
ADD COLUMN computed_full_name TEXT GENERATED ALWAYS AS (
    CASE 
        WHEN first_name IS NOT NULL AND last_name IS NOT NULL AND first_name != '' AND last_name != '' 
        THEN first_name || ' ' || last_name
        WHEN first_name IS NOT NULL AND first_name != '' 
        THEN first_name
        WHEN last_name IS NOT NULL AND last_name != '' 
        THEN last_name
        ELSE full_name
    END
) STORED;

-- Update updated_at timestamp
UPDATE public.profiles SET updated_at = NOW();
```

3. **Click "RUN" to execute the migration**

4. **Verify the migration succeeded** - you should see success messages for each statement

## Option 2: Using Service Role Key (Alternative)

If you want to run migrations programmatically in the future:

1. Get your service role key from:
   https://supabase.com/dashboard/project/aiveyvvhlfiqhbaqazrr/settings/api

2. Use the `run-migration-service-role.js` script I created, updating it with your service role key

## Verification

After running the migration, test it:

```bash
node test-signup-flow.js
```

This will verify:
- ✅ New columns exist (first_name, last_name, computed_full_name)
- ✅ Split function works correctly
- ✅ Existing data was migrated
- ✅ New signups will have names split automatically

## Testing the New Signup Flow

1. Visit http://localhost:8080/signup
2. You'll see separate "First Name" and "Last Name" fields
3. Sign up with a test account
4. The database will automatically store both versions

## Next Steps

Once the migration is complete:
- Test the signup flow with new users
- Verify existing users have their names properly split
- The PersonalInfoStep in the wizard will pre-populate with split names
- Profile pages will display names correctly

## Troubleshooting

If you encounter any issues:
- Check the Supabase logs for error messages
- Ensure you're running the migration as an admin user
- If a statement fails with "already exists", it may have been partially applied

Let me know once you've run the migration, and I'll help verify everything is working correctly!