# Authentication Trigger Fix Guide

## 🔍 Problem Diagnosis

The error "Database error saving new user" occurs when creating new accounts because the `handle_new_user()` database trigger is failing. This trigger automatically creates a profile record when a new user signs up.

## 🧪 Root Cause Analysis

The issue stems from **conflicting migrations** that have created mismatched versions of the `handle_new_user()` function:

1. **Migration 20250620145622**: Creates function without `first_name`, `last_name`, `phone`
2. **Migration 20241224000000**: Updates function to include `first_name`, `last_name` but removes `phone`  
3. **Migration 20250622120000**: Updates function to include `phone` but removes `first_name`, `last_name`
4. **Migration 20250630000001**: Tries to include all fields but may have column order issues

The trigger function is trying to insert into columns that may not exist or in the wrong order, causing the profile creation to fail.

## 🚀 Solution Options

### Option 1: Apply Complete Fix (Recommended)

Run this migration to ensure all columns exist and the function works correctly:

**File**: `supabase/migrations/20250630000002-fix-auth-trigger-final.sql`

This migration:
- ✅ Safely adds all required columns (`first_name`, `last_name`, `phone`)
- ✅ Recreates the `split_full_name()` function
- ✅ Creates a robust `handle_new_user()` function with error handling
- ✅ Provides diagnostic functions to test the setup
- ✅ Includes a function to create missing profiles for existing users

### Option 2: Temporarily Disable Trigger (Quick Fix)

If you need to create test accounts immediately without fixing the underlying issue:

**File**: `supabase/migrations/20250630000003-disable-auth-trigger-temp.sql`

This migration:
- ⚡ Disables the problematic trigger
- 🔧 Provides manual profile creation function
- 🔄 Includes function to re-enable trigger later

## 📋 Step-by-Step Fix Instructions

### Step 1: Choose Your Approach

**For Production/Permanent Fix:**
```sql
-- Apply the complete fix migration in Supabase Dashboard SQL Editor
-- File: supabase/migrations/20250630000002-fix-auth-trigger-final.sql
```

**For Quick Testing:**
```sql
-- Apply the temporary disable migration
-- File: supabase/migrations/20250630000003-disable-auth-trigger-temp.sql
```

### Step 2: Verify the Fix

Run the diagnostic test:
```bash
node test-trigger-fix.js
```

This will check:
- ✅ Table structure completeness
- ✅ Function availability
- ✅ Actual signup test
- ✅ Profile auto-creation

### Step 3: Create Missing Profiles (If Needed)

If you had existing users without profiles:

```sql
-- Run this in Supabase Dashboard
SELECT public.create_missing_profiles_safe();
```

## 🔧 Manual Database Commands

### Check Current State
```sql
-- Check profiles table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles' 
ORDER BY ordinal_position;

-- Check for users without profiles
SELECT COUNT(*) FROM auth.users au 
LEFT JOIN public.profiles p ON au.id = p.id 
WHERE p.id IS NULL;

-- Test the trigger function exists
SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';
```

### Quick Fixes
```sql
-- Disable trigger immediately
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Re-enable trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Test table structure
SELECT public.test_auth_trigger();
```

## 🧪 Testing Your Fix

### Test 1: Basic Function Test
```javascript
// Run: node test-trigger-fix.js
// This will diagnose the exact issue and test signup
```

### Test 2: Manual Signup Test
1. Go to your app's signup page
2. Try creating a new account
3. Check if the profile is created in the database

### Test 3: Existing User Check
```sql
-- Verify existing profiles
SELECT id, email, full_name, first_name, last_name, phone 
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 5;
```

## 🚨 Common Issues & Solutions

### Issue: "Column does not exist"
**Solution**: Apply the complete fix migration - some columns are missing

### Issue: "Function does not exist"  
**Solution**: The `split_full_name` or `handle_new_user` functions need to be recreated

### Issue: "Permission denied"
**Solution**: Functions need `SECURITY DEFINER` to access auth schema

### Issue: "Still can't create users"
**Solution**: Use the temporary disable option and create profiles manually

## 📁 Files Created

1. **`supabase/migrations/20250630000002-fix-auth-trigger-final.sql`**
   - Complete fix with error handling
   - Safely adds missing columns
   - Includes diagnostic functions

2. **`supabase/migrations/20250630000003-disable-auth-trigger-temp.sql`**
   - Temporary workaround
   - Disables problematic trigger
   - Provides manual profile creation

3. **`test-trigger-fix.js`**
   - Diagnostic test script
   - Tests actual signup flow
   - Identifies specific failure points

## 🎯 Next Steps After Fix

1. **Test thoroughly**: Create a few test accounts to verify everything works
2. **Clean up**: Remove any test accounts created during debugging
3. **Monitor**: Watch for any new authentication issues
4. **Document**: Update your team on the fix and any changes to the signup flow

## 📞 Support

If you continue to have issues:
1. Check the Supabase Dashboard → Authentication → Users
2. Check the Database → Profiles table
3. Look at the Database → Functions for `handle_new_user`
4. Review the SQL Editor → History for applied migrations

The complete fix should resolve the "Database error saving new user" issue permanently.