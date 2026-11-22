import Link from 'next/link';
import type { adminClient } from '@/lib/admin/supabase';
import { leadStages } from './modules';
import ProductDashboardSelect from './product-dashboard-select';

export const dashboards = [
  { key: 'overview', name: 'Agency overview' },
  { key: 'sales', name: 'Sales pipeline' },
  { key: 'leads', name: 'Lead performance' },
  { key: 'projects', name: 'Project progress' },
  { key: 'website', name: 'Website' },
  { key: 'seo', name: 'SEO' },
  { key: 'content', name: 'Content' },
  { key: 'custom', name: 'Custom solutions' },
  { key: 'erp', name: 'ERP' },
  { key: 'finance', name: 'Finance & expenses' },
  { key: 'team', name: 'Team productivity' },
  { key: 'clients', name: 'Client health' },
] as const;

export function DashboardSwitcher({ active }: { active: string }) {
  const products = ['website', 'seo', 'content', 'custom', 'erp'];
  return <nav className="dashboard-switcher" aria-label="Dashboard views"><Link href="/admin" aria-current={active === 'overview' ? 'page' : undefined}>Agency overview</Link><ProductDashboardSelect active={active}/>{dashboards.filter(item => item.key !== 'overview' && !products.includes(item.key)).map(item => <Link key={item.key} href={`/admin?dashboard=${item.key}`} aria-current={item.key === active ? 'page' : undefined}>{item.name}</Link>)}</nav>;
}

export async function DashboardView({ active, client }: { active: string; client: Awaited<ReturnType<typeof adminClient>> }) {
  const name = dashboards.find(item => item.key === active)?.name || 'Agency overview';
  const byService: Record<string, string> = { website: 'Website', seo: 'SEO', content: 'Content Writing', custom: 'Custom Solutions', erp: 'ERP' };
  const service = byService[active];
  let metrics: { label: string; value: number | string | null; href: string }[] = [];
  let detail = 'Counts are all-time and reflect the records currently available.';

  if (active === 'sales' || active === 'leads') {
    const results = await Promise.all(leadStages.map(stage => client.from('erp_leads').select('id', { count: 'exact', head: true }).eq('stage', stage)));
    metrics = leadStages.map((stage, index) => ({ label: stage, value: results[index].count, href: '/admin/sales' }));
    detail = 'Lead counts by current stage. Legacy leads awaiting reassignment are excluded from these stage counts.';
  } else if (service) {
    const [leads, projects, activeProjects] = await Promise.all([
      client.from('erp_leads').select('id', { count: 'exact', head: true }).eq('service', service),
      client.from('erp_projects').select('id', { count: 'exact', head: true }).eq('service', service),
      client.from('erp_projects').select('id', { count: 'exact', head: true }).eq('service', service).eq('status', 'Active'),
    ]);
    metrics = [{ label: 'Leads', value: leads.count, href: '/admin/sales' }, { label: 'Projects', value: projects.count, href: '/admin/projects' }, { label: 'Active projects', value: activeProjects.count, href: '/admin/projects' }];
    detail = `All-time ${service} records. The linked workspaces show all services.`;
  } else if (active === 'projects') {
    const stages = ['Planned', 'Active', 'Blocked', 'Client Review', 'On Hold', 'Completed'];
    const results = await Promise.all(stages.map(status => client.from('erp_projects').select('id', { count: 'exact', head: true }).eq('status', status)));
    metrics = stages.map((status, index) => ({ label: status, value: results[index].count, href: '/admin/projects' }));
  } else if (active === 'finance') {
    const stages = ['Unspecified', 'Pending', 'Paid'];
    const [results, total] = await Promise.all([Promise.all(stages.map(status => client.from('erp_expenses').select('id', { count: 'exact', head: true }).eq('status', status))), client.rpc('erp_expense_total')]);
    metrics = stages.map((status, index) => ({ label: `${status} expenses`, value: results[index].count, href: '/admin/finance' }));
    metrics.unshift({ label: 'Recorded expenses', value: total.error ? null : `₹${Number(total.data).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, href: '/admin/finance' });
    detail = 'All recorded expenses, including pending and paid amounts. Invoices, payments and revenue reporting are not yet available.';
  } else if (active === 'team') {
    const stages = ['To do', 'In progress', 'Done'];
    const results = await Promise.all(stages.map(status => client.from('erp_tasks').select('id', { count: 'exact', head: true }).eq('status', status)));
    metrics = stages.map((status, index) => ({ label: `${status} tasks`, value: results[index].count, href: '/admin/tasks' }));
    detail = 'Tasks by status. Team assignments and individual workloads are not yet available.';
  } else if (active === 'clients') {
    const result = await client.from('erp_clients').select('id', { count: 'exact', head: true });
    metrics = [{ label: 'Clients', value: result.count, href: '/admin/clients' }];
    detail = 'Total client records. Client health and renewal tracking are not yet available.';
  }
  return <><div className="admin-heading"><div><p className="admin-kicker">DASHBOARDS</p><h1>{name}<span>.</span></h1><p>{detail}</p></div></div><section className="admin-stats dashboard-metrics" aria-label={`${name} metrics`}>{metrics.map(metric => <Link className="stat-card" href={metric.href} key={metric.label}><span>{metric.label}</span><strong>{metric.value ?? '—'}</strong><small>View records</small></Link>)}</section>{metrics.some(item => item.value === null) && <p className="module-alert" role="alert">Some counts are unavailable. Check that the latest Supabase migrations have been applied.</p>}</>;
}
