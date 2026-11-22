import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { adminClient } from '@/lib/admin/supabase';
import AdminShell from '../shell';
import RecordViews from '../record-views';
import LeadStageForm from '../lead-stage-form';
import LeadTable from '../lead-table';
import CreateRecordDialog from '../create-record-dialog';
import { createRecord, updateStatus } from '../actions';
import { leadStages, moduleDefinitions, services, type ModuleKey } from '../modules';
import '../admin.css';

const planned: Record<string, string> = { marketing: 'Marketing', reports: 'Reports', team: 'Team', settings: 'Admin' };
const statuses: Record<string, string[]> = {
  projects: ['Draft', 'Planned', 'Active', 'Blocked', 'Client Review', 'On Hold', 'Completed', 'Cancelled', 'Archived'],
  tasks: ['To do', 'In progress', 'Done'],
};

export default function ModulePage(props: { params: Promise<{ module: string }>; searchParams: Promise<{ error?: string; saved?: string; page?: string; view?: string; q?: string; stage?: string; service?: string; sort?: string }> }) {
  return <Suspense fallback={<div className="admin-loading">Loading workspace…</div>}><ModuleContent {...props}/></Suspense>;
}

async function ModuleContent({ params, searchParams }: { params: Promise<{ module: string }>; searchParams: Promise<{ error?: string; saved?: string; page?: string; view?: string; q?: string; stage?: string; service?: string; sort?: string }> }) {
  const { module } = await params;
  const search = await searchParams;
  if (!Object.hasOwn(moduleDefinitions, module) && !Object.hasOwn(planned, module)) notFound();
  const client = await adminClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect('/admin');
  const { data: member } = await client.from('erp_members').select('role').eq('user_id', user.id).eq('active', true).maybeSingle();
  if (!member) redirect('/admin');
  const isAdmin = ['founder', 'admin'].includes(member.role);
  if (!isAdmin && module !== 'tasks') redirect('/admin/tasks');
  if (module in planned) return <AdminShell user={user.email || 'Founder'} active={module}><div className="admin-breadcrumb">Workspace / {planned[module]}</div><div className="admin-heading"><div><p className="admin-kicker">WORKSPACE</p><h1>{planned[module]}</h1><p>This module is planned for a later stage of the ERP.</p></div></div><div className="admin-empty enquiry-panel"><strong>No workspace data is available yet</strong><p>Use the existing Sales, Projects and Finance sections to manage records.</p></div></AdminShell>;

  const definition = moduleDefinitions[module as ModuleKey];
  const dialogModule = isAdmin && (module === 'sales' || module === 'projects' || module === 'finance' || module === 'tasks') ? module : null;
  const assigneeResult = module === 'tasks' && isAdmin ? await client.rpc('erp_assignable_members') : null;
  const assignees: { user_id: string; display_name: string | null }[] = assigneeResult?.data || [];
  const page = Math.max(1, Math.min(10000, Number.parseInt(search.page || '1', 10) || 1));
  const leadSearch = (search.q || '').trim().slice(0, 100).replace(/[%_\\]/g, '');
  const leadStage = [...leadStages, 'Legacy'].includes(search.stage || '') ? search.stage! : '';
  const leadService = services.includes(search.service || '') ? search.service! : '';
  const leadSort = ['newest', 'oldest', 'name'].includes(search.sort || '') ? search.sort! : 'newest';
  let records = client.from(definition.table).select('*', { count: 'exact' });
  if (module === 'sales' && leadSearch) records = records.ilike('name', `%${leadSearch}%`);
  if (module === 'sales' && leadStage) records = records.eq('stage', leadStage);
  if (module === 'sales' && leadService) records = records.eq('service', leadService);
  records = records.order(module === 'sales' && leadSort === 'name' ? 'name' : 'created_at', { ascending: module === 'sales' && (leadSort === 'oldest' || leadSort === 'name') }).order('id', { ascending: true });
  const { data, count, error: recordsError } = await records.range((page - 1) * 10, page * 10 - 1);
  const statusCheck = module === 'finance' ? await client.from(definition.table).select('status', { head: true }).limit(1) : module === 'sales' ? await client.from(definition.table).select('previous_stage,closing_price,source,priority,estimated_value,owner_id,last_contact_at', { head: true }).limit(1) : module === 'tasks' ? await client.from(definition.table).select('assignee_id,details', { head: true }).limit(1) : null;
  const error = recordsError || statusCheck?.error || assigneeResult?.error;
  const label: Record<string, string> = { name: 'Full name', company: 'Company', phone: 'Phone number', email: 'Email address', service: 'Service', next_follow_up_at: 'Next follow-up', title: module === 'tasks' ? 'Task title' : 'Project title', due_date: 'Due date', description: 'Description', amount: 'Amount (INR)', expense_date: 'Expense date', note: 'Expense note (optional)' };
  const required = ['name', 'title', 'service', 'description', 'amount', 'expense_date'];
  return <AdminShell user={user.email || 'User'} active={module} limited={!isAdmin}><div className="admin-breadcrumb">Workspace / {module === 'tasks' ? 'Tasks' : definition.section} / {definition.title}</div><div className="admin-heading"><div><p className="admin-kicker">{definition.section.toUpperCase()}</p><h1>{module === 'tasks' && !isAdmin ? 'My tasks' : definition.title}<span>.</span></h1><p>{module === 'tasks' && !isAdmin ? 'Tasks assigned to you.' : `Manage your ${definition.title.toLowerCase()} in one place.`}</p></div>{dialogModule && !error ? <CreateRecordDialog module={dialogModule} assignees={assignees}/> : isAdmin && !dialogModule ? <a className="admin-outline" href="#new-record">Add {definition.noun}</a> : null}</div>{search.error && <p className="module-alert" role="alert">{search.error === 'followup' ? 'Choose a valid follow-up date before saving.' : search.error === 'price' ? 'Enter a valid closing price before saving.' : search.error === 'invalid' ? 'Check the form fields and try again.' : 'Could not save this record. Check that the migration has been applied.'}</p>}{search.saved && <p className="module-success" role="status">Your changes have been saved.</p>}<div className={dialogModule || module === 'tasks' ? "module-grid module-grid-full" : "module-grid"}><section className="enquiry-panel module-list"><div className="panel-heading"><div><p className="admin-kicker">{definition.section.toUpperCase()}</p><h2>{definition.title}</h2></div><span className="panel-count">{count ?? '—'} RECORDS</span></div>{error ? <div className="admin-empty" role="alert"><strong>Records are unavailable</strong><p>Run the ERP workflows migration in Supabase and refresh this page.</p></div> : module === 'sales' ? <LeadTable leads={data || []} count={count || 0} filters={{ q: leadSearch, stage: leadStage, service: leadService, sort: leadSort, page }}/> : module === 'tasks' || module === 'finance' ? <RecordViews module={module} items={data || []} view={search.view === 'table' ? 'table' : 'kanban'} page={page} count={count || 0} canAssign={module === 'tasks' && isAdmin} assignees={assignees}/> : data?.length ? <><div className="module-records">{data.map(row => <article className="module-record" key={row.id}><div><strong>{row.name || row.title || row.description}</strong><p>{[row.company, row.phone, row.email, row.service, row.amount ? `₹${Number(row.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '', row.due_date ? `Due ${row.due_date}` : '', row.stage === 'Follow Up' && row.next_follow_up_at ? `Follow-up ${row.next_follow_up_at}` : '', row.stage === 'Closed' && row.closing_price ? `Closed at INR ${Number(row.closing_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : ''].filter(Boolean).join(' · ') || 'No additional details'}</p>{module === 'finance' && row.note && <p className="expense-note"><strong>Note:</strong> {row.note}</p>}<small>Created {new Date(row.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</small></div>{module === 'sales' && <LeadStageForm id={row.id} name={row.name} stage={row.stage} previousStage={row.previous_stage} followUp={row.next_follow_up_at} closingPrice={row.closing_price}/>} {statuses[module] && <form action={updateStatus} className="status-form"><input type="hidden" name="module" value={module}/><input type="hidden" name="id" value={row.id}/><label className="sr-only" htmlFor={`status-${row.id}`}>Status for {row.name || row.title}</label><select id={`status-${row.id}`} name="status" defaultValue={row.stage || row.status}>{statuses[module].map(status => <option key={status}>{status}</option>)}</select><button type="submit">Save</button></form>}</article>)}</div><div className="admin-pagination"><span>Page {page}</span><div>{page > 1 && <a href={`?page=${page - 1}`}>Previous</a>}{count !== null && page * 10 < count && <a href={`?page=${page + 1}`}>Next</a>}</div></div></> : <div className="admin-empty"><span>✳</span><strong>No {definition.title.toLowerCase()} yet</strong><p>Use the form to add your first {definition.noun}.</p></div>}</section>{isAdmin && !dialogModule && <section className="enquiry-panel module-create" id="new-record"><p className="admin-kicker">QUICK CREATE</p><h2>New {definition.noun}</h2><p>Add the essential details to get started.</p><form action={createRecord}><input type="hidden" name="module" value={module}/>{definition.fields.map(field => <label key={field}>{label[field]}{field === 'note' ? <textarea name="note" rows={4} maxLength={2000} placeholder="Add any details about this expense"/> : field === 'service' ? <select name={field} required defaultValue=""><option value="" disabled>Select a service</option>{services.map(service => <option key={service}>{service}</option>)}</select> : <input name={field} type={field.includes('date') || field.endsWith('_at') ? 'date' : field === 'email' ? 'email' : field === 'amount' ? 'number' : field === 'phone' ? 'tel' : 'text'} required={required.includes(field)} maxLength={field === 'amount' ? undefined : 160} min={field === 'amount' ? '0.01' : undefined} step={field === 'amount' ? '0.01' : undefined}/>}</label>)}<button className="admin-primary" type="submit">Create {definition.noun}</button></form></section>}</div></AdminShell>;
}
