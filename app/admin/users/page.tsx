import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { adminClient } from '@/lib/admin/supabase';
import AdminShell from '../shell';
import { roleLabel } from '../user-roles';
import CreateUserDialog from './create-user-dialog';
import '../admin.css';

export const metadata: Metadata = { title: 'Users | Trilancers', robots: { index: false, follow: false } };
type Search = { error?: string; created?: string; page?: string };

export default function UsersPage({ searchParams }: { searchParams: Promise<Search> }) {
  return <Suspense fallback={<div className="admin-loading">Loading users…</div>}><UsersContent searchParams={searchParams}/></Suspense>;
}

async function UsersContent({ searchParams }: { searchParams: Promise<Search> }) {
  const search = await searchParams;
  const client = await adminClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect('/admin');
  const { data: member, error: membershipError } = await client.from('erp_members').select('role').eq('user_id', user.id).eq('active', true).maybeSingle();
  if (membershipError || !member || !['founder', 'admin'].includes(member.role)) redirect('/admin');
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return <AdminShell user={user.email || 'Admin'} active="users"><div className="module-alert" role="alert">User management requires the server-side Supabase secret key.</div></AdminShell>;
  const privileged = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const page = Math.max(1, Math.min(10000, Number.parseInt(search.page || '1', 10) || 1));
  const { data: members, count, error } = await privileged.from('erp_members').select('user_id,role,active,display_name,created_at', { count: 'exact' }).order('created_at', { ascending: false }).order('user_id').range((page - 1) * 10, page * 10 - 1);
  const rows = await Promise.all((members || []).map(async item => {
    const { data } = await privileged.auth.admin.getUserById(item.user_id);
    return { ...item, email: data.user?.email || null };
  }));
  const messages: Record<string, string> = {
    invalid: 'Check the name, email, role and password. Passwords must be at least 12 characters.',
    config: 'The server-side Supabase configuration is incomplete.',
    create: 'The account could not be created. Check the email address and whether it already has an account.',
    membership: 'The role could not be saved. The new account was removed. Check the user roles migration.',
    partial: 'The role could not be saved and account cleanup failed. Check Supabase Authentication before retrying.',
  };
  return <AdminShell user={user.email || 'Admin'} active="users"><div className="admin-breadcrumb">Workspace / Admin / Users</div><div className="admin-heading"><div><p className="admin-kicker">ADMIN</p><h1>Users<span>.</span></h1><p>Manage the people and roles in your workspace.</p></div><CreateUserDialog/></div>{search.error && <p className="module-alert" role="alert">{messages[search.error] || 'The user could not be created.'}</p>}{search.created && <p className="module-success" role="status">User created successfully.</p>}<section className="enquiry-panel"><div className="panel-heading"><div><p className="admin-kicker">USER MANAGEMENT</p><h2>Workspace users</h2><p>Accounts and their assigned roles.</p></div><span className="panel-count">{count ?? '—'} USERS</span></div>{error ? <div className="admin-empty" role="alert"><strong>Unable to load users</strong><p>Apply the user roles migration and check the server configuration.</p></div> : rows.length ? <><div className="board-table-wrap"><table className="board-table users-table"><thead><tr><th scope="col">Name</th><th scope="col">Email</th><th scope="col">Role</th><th scope="col">Status</th><th scope="col">Added</th></tr></thead><tbody>{rows.map(item => <tr key={item.user_id}><td><strong>{item.display_name || '—'}</strong></td><td>{item.email || 'Unavailable'}</td><td>{roleLabel(item.role)}</td><td>{item.active ? 'Active' : 'Inactive'}</td><td>{new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })}</td></tr>)}</tbody></table></div><div className="admin-pagination"><span>Page {page}</span><div>{page > 1 && <Link href={`/admin/users?page=${page - 1}`}>Previous</Link>}{count !== null && page * 10 < count && <Link href={`/admin/users?page=${page + 1}`}>Next</Link>}</div></div></> : <div className="admin-empty"><strong>No users found</strong></div>}</section></AdminShell>;
}
