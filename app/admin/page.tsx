import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { adminClient } from '@/lib/admin/supabase';
import { signIn, signOut } from './actions';
import AdminShell from './shell';
import PasswordField from './password-field';
import { redirect } from 'next/navigation';
import { DashboardSwitcher, DashboardView, dashboards } from './dashboards';
import './admin.css';

export const metadata: Metadata = { title: 'Admin | Trilancers', robots: { index: false, follow: false } };
type Search = { dashboard?: string; error?: string; q?: string; service?: string; page?: string };

export default function AdminPage({ searchParams }: { searchParams: Promise<Search> }) {
  return <Suspense fallback={<div className="admin-loading">Loading workspace…</div>}><AdminContent searchParams={searchParams} /></Suspense>;
}

async function AdminContent({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  if (!process.env.SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return <div className="admin-login"><div className="login-card"><p className="admin-kicker">TRILANCERS / WORKSPACE</p><h1>Set up admin access</h1><p>Add the Supabase URL and publishable key to the server environment to enable sign-in.</p></div></div>;
  }
  const client = await adminClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return <main className="admin-login"><div className="login-card"><div className="admin-logo"><b>T<span>.</span></b> trilancers<span>.</span></div><p className="admin-kicker">YOUR WORKSPACE</p><h1>Welcome back<span>.</span></h1><p>Sign in to access your Trilancers workspace.</p><form action={signIn}><label>Work email<input type="email" name="email" autoComplete="email" required /></label><PasswordField label="Password" autoComplete="current-password" />{params.error && <p className="admin-error" role="alert">Unable to sign in. Check your email and password.</p>}<button className="admin-primary">Sign in</button></form></div><div className="login-note">TRILANCERS <span>•</span> A LITTLE MORE POSSIBLE</div></main>;

  const { data: member, error: membershipError } = await client.from('erp_members').select('role').eq('user_id', user.id).eq('active', true).maybeSingle();
  if (membershipError || !member) return <main className="admin-login"><div className="login-card"><p className="admin-kicker">TRILANCERS / WORKSPACE</p><h1>Access unavailable</h1><p>Your account is not an active workspace member, or the admin migration has not been applied. Contact your workspace administrator.</p><form action={signOut}><button className="admin-primary">Sign out</button></form></div></main>;

  if (!['founder', 'admin'].includes(member.role)) redirect('/admin/tasks');

  const selectedDashboard = dashboards.some(item => item.key === params.dashboard) ? params.dashboard! : 'overview';
  if (selectedDashboard !== 'overview') return <AdminShell user={user.email || 'Founder'} active="dashboard" dashboard={selectedDashboard}><div className="admin-breadcrumb">Workspace / Dashboards</div><DashboardSwitcher active={selectedDashboard}/><DashboardView active={selectedDashboard} client={client}/></AdminShell>;

  const search = (params.q || '').trim().slice(0, 100);
  const services = ['Website', 'SEO', 'Content Writing', 'Custom Solutions', "ERP's"];
  const service = services.includes(params.service || '') ? params.service : '';
  const pageNumber = Math.max(1, Math.min(10000, Number.parseInt(params.page || '1', 10) || 1));
  let query = client.from('contact_submissions').select('id,name,phone,service,message,created_at', { count: 'exact' }).order('created_at', { ascending: false });
  if (search) query = query.ilike('name', `%${search.replace(/[%_\\]/g, '')}%`);
  if (service) query = query.eq('service', service);
  const { data: enquiries, count, error } = await query.range((pageNumber - 1) * 10, pageNumber * 10 - 1);
  const { count: total } = await client.from('contact_submissions').select('id', { count: 'exact', head: true });
  const [leadCount, projectCount, taskCount] = await Promise.all([
    client.from('erp_leads').select('id', { count: 'exact', head: true }),
    client.from('erp_projects').select('id', { count: 'exact', head: true }).eq('status', 'Active'),
    client.from('erp_tasks').select('id', { count: 'exact', head: true }).neq('status', 'Done').lt('due_date', new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })),
  ]);
  const pageLink = (page: number) => `/admin?${new URLSearchParams({ ...(search ? { q: search } : {}), ...(service ? { service } : {}), page: String(page) })}`;

  return <AdminShell user={user.email || 'Founder'} active="dashboard"><div className="admin-breadcrumb">Workspace <span>/</span> Agency overview</div><DashboardSwitcher active="overview"/><div className="admin-heading"><div><p className="admin-kicker">YOUR WORKSPACE</p><h1>Good to have you here<span>.</span></h1><p>A clear view of the conversations coming into your business.</p></div><a className="admin-outline" href="#enquiries">View enquiries</a></div><div className="dashboard-toolbar"><div><span>AGENCY OVERVIEW</span><p>All-time totals ? updated when you load this page</p></div><Link href="/admin/sales">Manage leads</Link></div><section className="admin-stats dashboard-stats" aria-label="Agency summary"><a className="stat-card" href="#enquiries"><span>Website enquiries</span><strong>{total ?? '?'}</strong><small>All submissions</small></a><Link className="stat-card" href="/admin/sales"><span>Total leads</span><strong>{leadCount.count ?? '?'}</strong><small>All lead records</small></Link><Link className="stat-card" href="/admin/projects"><span>Active projects</span><strong>{projectCount.count ?? '?'}</strong><small>Currently active</small></Link><Link className="stat-card" href="/admin/tasks"><span>Overdue tasks</span><strong>{taskCount.count ?? '?'}</strong><small>Incomplete and past due</small></Link></section><section className="attention-panel"><div><p className="admin-kicker">NEEDS ATTENTION</p><h2>Keep work moving</h2><p>Review incoming enquiries and tasks that need your attention.</p></div><div className="attention-links"><a href="#enquiries">Website enquiries <strong>{total ?? '?'}</strong></a><Link href="/admin/tasks">Overdue tasks <strong>{taskCount.count ?? '?'}</strong></Link></div></section><section id="enquiries" className="enquiry-panel"><div className="panel-heading"><div><p className="admin-kicker">SALES CRM</p><h2>Website enquiries</h2><p>Messages submitted through your website contact form.</p></div><span className="panel-count">{count ?? '—'} RESULTS</span></div><form className="admin-filters"><label><span className="sr-only">Search by name</span><input name="q" defaultValue={search} placeholder="Search by name" maxLength={100}/></label><label><span className="sr-only">Filter by service</span><select name="service" defaultValue={service}><option value="">All services</option>{services.map(item => <option key={item}>{item}</option>)}</select></label><button type="submit">Apply filters</button><Link href="/admin#enquiries">Reset</Link></form>{error ? <div className="admin-empty" role="alert"><strong>Unable to load enquiries.</strong><p>Check that the admin migration and access policies are configured.</p></div> : enquiries?.length ? <><div className="table-wrap"><table><thead><tr><th>CONTACT</th><th>PHONE</th><th>SERVICE</th><th>MESSAGE</th><th>RECEIVED</th></tr></thead><tbody>{enquiries.map(item => <tr key={item.id}><td><strong>{item.name}</strong></td><td><a href={`tel:${item.phone}`}>{item.phone}</a></td><td><span className="service-badge">{item.service}</span></td><td className="message-cell">{item.message || '—'}</td><td>{new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })}</td></tr>)}</tbody></table></div><div className="admin-records">{enquiries.map(item => <article key={item.id}><div><strong>{item.name}</strong><span className="service-badge">{item.service}</span></div><a href={`tel:${item.phone}`}>{item.phone}</a><p>{item.message || 'No message provided'}</p><small>{new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })}</small></article>)}</div><div className="admin-pagination"><span>Page {pageNumber}</span><div>{pageNumber > 1 && <a href={pageLink(pageNumber - 1)}>Previous</a>}{count !== null && pageNumber * 10 < count && <a href={pageLink(pageNumber + 1)}>Next</a>}</div></div></> : <div className="admin-empty"><span>✳</span><strong>No enquiries found</strong><p>New website enquiries will appear here. Try adjusting your filters.</p></div>}</section></AdminShell>;
}
