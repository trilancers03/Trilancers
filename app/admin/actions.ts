'use server';

import { redirect } from 'next/navigation';
import { adminClient } from '@/lib/admin/supabase';
import { boardStatuses, leadStages, moduleDefinitions, services, type ModuleKey } from './modules';
import { revalidatePath } from 'next/cache';

export async function signIn(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  if (!email || !password) redirect('/admin?error=credentials');
  const client = await adminClient();
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) redirect('/admin?error=credentials');
  redirect('/admin');
}

export async function signOut() {
  const client = await adminClient();
  await client.auth.signOut();
  redirect('/admin');
}

export async function createRecord(formData: FormData) {
  const moduleName = String(formData.get('module') || '') as ModuleKey;
  if (!Object.hasOwn(moduleDefinitions, moduleName)) throw new Error('Invalid module');
  const definition = moduleDefinitions[moduleName];
  const client = await adminClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect('/admin');
  const { data: member } = await client.from('erp_members').select('role').eq('user_id', user.id).eq('active', true).maybeSingle();
  if (!member || !['founder', 'admin'].includes(member.role)) throw new Error('Access denied');

  const record: Record<string, string | number | null> = {};
  for (const field of definition.fields) {
    const value = String(formData.get(field) || '').trim();
    const maxLength = field === 'note' ? 2000 : 160;
    if (value.length > maxLength) redirect(`/admin/${moduleName}?error=invalid`);
    record[field] = value || null;
  }
  const primary = moduleName === 'finance' ? 'description' : moduleName === 'projects' || moduleName === 'tasks' ? 'title' : 'name';
  if (!record[primary]) redirect(`/admin/${moduleName}?error=invalid`);
  if ('service' in record && !services.includes(String(record.service))) redirect(`/admin/${moduleName}?error=invalid`);
  if (moduleName === 'sales') {
    if (record.priority && !['Low', 'Medium', 'High'].includes(String(record.priority))) redirect('/admin/sales?error=invalid');
    if (record.estimated_value !== null) {
      const raw = String(record.estimated_value);
      if (!/^\d{1,10}(\.\d{1,2})?$/.test(raw)) redirect('/admin/sales?error=invalid');
      record.estimated_value = Number(raw);
    }
  }
  if (moduleName === 'finance') {
    const amount = Number(record.amount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 9999999999.99 || !record.expense_date) redirect('/admin/finance?error=invalid');
    record.amount = amount;
  }
  let error;
  if (moduleName === 'tasks') {
    const assignee = String(formData.get('assignee_id') || '').trim();
    const details = String(formData.get('details') || '').trim();
    if ((assignee && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(assignee)) || details.length > 2000) redirect('/admin/tasks?error=invalid');
    ({ error } = await client.rpc('erp_create_general_task', { p_title: record.title, p_due_date: record.due_date, p_assignee_id: assignee || null, p_details: details || null }));
  } else {
    ({ error } = await client.from(definition.table).insert(record));
  }
  if (error) redirect(`/admin/${moduleName}?error=save`);
  revalidatePath(`/admin/${moduleName}`);
  revalidatePath('/admin');
  redirect(`/admin/${moduleName}?saved=1`);
}

export async function updateStatus(formData: FormData) {
  const moduleName = String(formData.get('module') || '');
  const id = String(formData.get('id') || '');
  const status = String(formData.get('status') || '');
  const options: Record<string, { table: string; column: string; values: string[] }> = {
    sales: { table: 'erp_leads', column: 'stage', values: leadStages },
    projects: { table: 'erp_projects', column: 'status', values: ['Draft', 'Planned', 'Active', 'Blocked', 'Client Review', 'On Hold', 'Completed', 'Cancelled', 'Archived'] },
    tasks: { table: 'erp_tasks', column: 'status', values: boardStatuses.tasks },
    finance: { table: 'erp_expenses', column: 'status', values: boardStatuses.finance },
  };
  const config = options[moduleName];
  if (!config || !/^[0-9a-f-]{36}$/i.test(id) || !config.values.includes(status)) throw new Error('Invalid update');
  const client = await adminClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect('/admin');
  const { data: member } = await client.from('erp_members').select('role').eq('user_id', user.id).eq('active', true).maybeSingle();
  if (!member || (moduleName !== 'tasks' && !['founder', 'admin'].includes(member.role))) throw new Error('Access denied');
  const changes: Record<string, string | number> = { [config.column]: status };
  if (moduleName === 'sales' && status === 'Follow Up') {
    const date = String(formData.get('next_follow_up_at') || '');
    const parsed = new Date(`${date}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== date) redirect('/admin/sales?error=followup');
    changes.next_follow_up_at = date;
  }
  if (moduleName === 'sales' && status === 'Closed') {
    const rawPrice = String(formData.get('closing_price') || '').trim();
    const price = Number(rawPrice);
    if (!/^\d{1,10}(\.\d{1,2})?$/.test(rawPrice) || !Number.isFinite(price) || price <= 0 || price > 9999999999.99) redirect('/admin/sales?error=price');
    changes.closing_price = price;
  }
  const { data: updated, error } = await client.from(config.table).update(changes).eq('id', id).select('id').maybeSingle();
  const view = formData.get('view') === 'table' ? '&view=table' : '';
  const page = Math.max(1, Math.min(10000, Number.parseInt(String(formData.get('page') || '1'), 10) || 1));
  if (error || !updated) redirect(`/admin/${moduleName}?error=save${view}&page=${page}`);
  revalidatePath(`/admin/${moduleName}`);
  revalidatePath('/admin');
  redirect(`/admin/${moduleName}?saved=1${view}&page=${page}`);
}

export async function assignTask(formData: FormData) {
  const taskId = String(formData.get('id') || '');
  const assignee = String(formData.get('assignee_id') || '');
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuid.test(taskId) || (assignee && !uuid.test(assignee))) throw new Error('Invalid assignment');
  const client = await adminClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect('/admin');
  const { data: member } = await client.from('erp_members').select('role').eq('user_id', user.id).eq('active', true).maybeSingle();
  if (!member || !['founder', 'admin'].includes(member.role)) throw new Error('Access denied');
  const { error } = await client.rpc('erp_assign_task', { p_task_id: taskId, p_assignee_id: assignee || null });
  const view = formData.get('view') === 'table' ? '&view=table' : '';
  const page = Math.max(1, Math.min(10000, Number.parseInt(String(formData.get('page') || '1'), 10) || 1));
  if (error) redirect(`/admin/tasks?error=save${view}&page=${page}`);
  revalidatePath('/admin/tasks');
  redirect(`/admin/tasks?saved=1${view}&page=${page}`);
}

export async function editTask(formData: FormData) {
  const taskId = String(formData.get('id') || '');
  const title = String(formData.get('title') || '').trim();
  const details = String(formData.get('details') || '').trim();
  const dueDate = String(formData.get('due_date') || '');
  const view = formData.get('view') === 'table' ? '&view=table' : '';
  const page = Math.max(1, Math.min(10000, Number.parseInt(String(formData.get('page') || '1'), 10) || 1));
  const date = dueDate ? new Date(`${dueDate}T00:00:00Z`) : null;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(taskId) || !title || title.length > 160 || details.length > 2000 || (dueDate && (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || !date || Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== dueDate))) redirect(`/admin/tasks?error=invalid${view}&page=${page}`);
  const client = await adminClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect('/admin');
  const { data: member } = await client.from('erp_members').select('role').eq('user_id', user.id).eq('active', true).maybeSingle();
  if (!member || !['founder', 'admin'].includes(member.role)) throw new Error('Access denied');
  const { error } = await client.rpc('erp_edit_general_task', { p_task_id: taskId, p_title: title, p_due_date: dueDate || null, p_details: details || null });
  if (error) redirect(`/admin/tasks?error=save${view}&page=${page}`);
  revalidatePath('/admin/tasks');
  revalidatePath('/admin');
  redirect(`/admin/tasks?saved=1${view}&page=${page}`);
}
