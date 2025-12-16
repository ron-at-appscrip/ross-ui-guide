#!/usr/bin/env node

/**
 * Script to apply the auth fix migration to Supabase
 * This fixes the 500 error on user signup
 */

const fs = require('fs');
const path = require('path');

async function applyMigration() {
  console.log('🔧 Applying auth fix migration...');
  
  const migrationPath = path.join(__dirname, 'supabase/migrations/20250630120000-fix-auth-500-error.sql');
  
  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migration file not found:', migrationPath);
    process.exit(1);
  }
  
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  
  console.log('📄 Migration file loaded successfully');
  console.log('📋 Migration contents:');
  console.log('─'.repeat(50));
  console.log(migrationSQL);
  console.log('─'.repeat(50));
  
  console.log('\n🚀 To apply this migration:');
  console.log('\n1. Option A - Using Supabase CLI:');
  console.log('   npx supabase db push');
  
  console.log('\n2. Option B - Using Supabase Dashboard:');
  console.log('   - Go to https://supabase.com/dashboard/project/aiveyvvhlfiqhbaqazrr/sql');
  console.log('   - Copy the migration SQL above');
  console.log('   - Paste and run it in the SQL editor');
  
  console.log('\n3. Option C - Using MCP Server:');
  console.log('   - Use the Supabase MCP server to apply the migration');
  console.log('   - Project ref: aiveyvvhlfiqhbaqazrr');
  
  console.log('\n✅ After applying the migration:');
  console.log('   - The 500 signup errors should be resolved');
  console.log('   - User registration will work properly');
  console.log('   - Profiles will be created safely');
  
  console.log('\n🔍 Migration summary:');
  console.log('   ✓ Removes problematic auth triggers');
  console.log('   ✓ Sets up clean profiles table');
  console.log('   ✓ Adds proper RLS policies');
  console.log('   ✓ Creates safe profile creation function');
  console.log('   ✓ Cleans up orphaned data');
}

applyMigration().catch(console.error);