# Authentication Fix Instructions

## Problem Summary
Login is failing because users exist in `auth.users` but have no corresponding profiles in `public.profiles`. This is because the `handle_new_user()` trigger is not working properly.

## Current State
- ❌ No profiles exist in the database (0 found)
- ❌ Signup fails with "Database error saving new user"
- ❌ Login fails because AuthContext expects profiles to exist
- ❌ The `handle_new_user()` function/trigger is missing or broken

## Fix Instructions

### Step 1: Access Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/aiveyvvhlfiqhbaqazrr
2. Navigate to SQL Editor

### Step 2: Run the Fix SQL
Copy and paste the entire contents of `MANUAL_SQL_FIX.sql` into the SQL Editor and run it.

Alternatively, you can copy this SQL directly:

```sql
-- Create the handle_new_user function
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

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create profiles for existing users
INSERT INTO public.profiles (id, email, full_name, first_name, last_name)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', 'User'),
  au.raw_user_meta_data->>'first_name',
  au.raw_user_meta_data->>'last_name'
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;
```

### Step 3: Verify the Fix
Run this test script to verify everything works:

```bash
node test-auth-fix.js
```

You should see:
- ✅ Profiles found in the database
- ✅ Profiles exist for your known email addresses
- ✅ New signup creates profiles automatically

### Step 4: Test Login
1. Open your application in the browser
2. Try logging in with `shivansh@trulyfreehome.com`
3. Login should now work properly

## What This Fix Does

1. **Creates the Function**: `handle_new_user()` function that automatically creates a profile when a new user signs up
2. **Creates the Trigger**: Automatically calls the function whenever a new user is inserted into `auth.users`
3. **Backfills Profiles**: Creates profiles for any existing users who don't have them
4. **Verifies Results**: Shows count of users vs profiles

## Expected Results

After running the fix:
- All existing auth users will have corresponding profiles
- New signups will automatically create profiles
- Login will work properly
- The app's AuthContext will be able to find user profiles

## Troubleshooting

If login still doesn't work after running the SQL:

1. Check browser console for specific errors
2. Run `node test-auth-fix.js` to verify profiles were created
3. Check the profiles table in Supabase Dashboard > Table Editor
4. Verify your auth session is valid in the browser's Application > Local Storage

## Files Created

- `MANUAL_SQL_FIX.sql` - Direct SQL to copy/paste
- `supabase/migrations/20250630000001-fix-auth-trigger.sql` - Migration format
- `test-auth-fix.js` - Test script to verify the fix
- `fix-database-trigger.js` - Diagnostic script
- `fix-rls-and-profiles.js` - Advanced diagnostic script

## Next Steps After Fix

Once authentication is working:
1. Test the complete signup flow
2. Test the wizard flow for new users
3. Verify profile updates work properly
4. Test OAuth login (Google/Apple) if used