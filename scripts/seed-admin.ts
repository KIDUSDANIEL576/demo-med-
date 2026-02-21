/**
 * Run this script to seed the Super Admin account securely.
 * Usage: npx ts-node scripts/seed-admin.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Must use Service Key for admin tasks

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'kidusdaniel576@gmail.com';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'secure-password-123';

async function seedAdmin() {
  console.log(`Seeding Super Admin: ${SUPER_ADMIN_EMAIL}`);

  // 1. Check if user exists
  const { data: users } = await supabase.auth.admin.listUsers();
  const existingUser = (users.users as any[]).find(u => u.email === SUPER_ADMIN_EMAIL);

  let userId;

  if (existingUser) {
    console.log('User already exists. Updating password...');
    const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      password: SUPER_ADMIN_PASSWORD,
      user_metadata: { role: 'Super Admin' }
    });
    if (error) throw error;
    userId = existingUser.id;
  } else {
    console.log('Creating new user...');
    const { data, error } = await supabase.auth.admin.createUser({
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { role: 'Super Admin' }
    });
    if (error) throw error;
    userId = data.user.id;
  }

  // 2. Create Profile Entry
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email: SUPER_ADMIN_EMAIL,
      name: 'Super Admin',
      role: 'Super Admin',
    });

  if (profileError) {
    console.error('Error creating profile:', profileError);
  } else {
    console.log('Super Admin Seeded Successfully! ✅');
  }
}

seedAdmin().catch(console.error);
