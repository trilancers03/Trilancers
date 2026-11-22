'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { adminClient } from '@/lib/admin/supabase';
import { userRoles } from '../user-roles';

export async function createUser(formData: FormData) {
  const client = await adminClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect('/admin');
  const { data: member, error: membershipError } = await client.from('erp_members').select('role').eq('user_id', user.id).eq('active', true).maybeSingle();
  if (membershipError || !member || !['founder', 'admin'].includes(member.role)) throw new Error('Access denied');

  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  const role = String(formData.get('role') || '');
  if (!name || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || password.length < 12 || password.length > 72 || !userRoles.some(item => item.value === role)) redirect('/admin/users?error=invalid');
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) redirect('/admin/users?error=config');
  const privileged = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const { data, error } = await privileged.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: name } });
  if (error || !data.user) redirect('/admin/users?error=create');

  const { error: insertError } = await privileged.from('erp_members').insert({ user_id: data.user.id, role, display_name: name, active: true });
  if (insertError) {
    const { error: rollbackError } = await privileged.auth.admin.deleteUser(data.user.id);
    if (rollbackError) redirect('/admin/users?error=partial');
    redirect('/admin/users?error=membership');
  }
  revalidatePath('/admin/users');
  redirect('/admin/users?created=1');
}
