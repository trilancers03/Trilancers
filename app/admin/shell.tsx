import Link from 'next/link';
import { signOut } from './actions';
import { dashboards } from './dashboards';

const modules = [
  { name: 'Dashboards', href: '/admin', key: 'dashboard' },
  { name: 'Sales CRM', href: '/admin/sales', key: 'sales' },
  { name: 'Projects', href: '/admin/projects', key: 'projects' },
  { name: 'Marketing', href: '/admin/marketing', key: 'marketing' },
  { name: 'Finance', href: '/admin/finance', key: 'finance' },
  { name: 'Reports', href: '/admin/reports', key: 'reports' },
  { name: 'Team', href: '/admin/team', key: 'team' },
  { name: 'Tasks', href: '/admin/tasks', key: 'tasks' },
  { name: 'Admin', href: '/admin/settings', key: 'settings' },
];

const sidebar: Record<string, { label: string; href: string }[]> = {
  dashboard: dashboards.map(item => ({ label: item.name, href: item.key === 'overview' ? '/admin' : `/admin?dashboard=${item.key}` })),
  sales: [{ label: 'All leads', href: '/admin/sales' }, { label: 'Website enquiries', href: '/admin#enquiries' }, { label: 'Clients', href: '/admin/clients' }],
  projects: [{ label: 'All projects', href: '/admin/projects' }, { label: 'Tasks & my work', href: '/admin/tasks' }],
  tasks: [{ label: 'All tasks', href: '/admin/tasks' }],
  finance: [{ label: 'Expenses', href: '/admin/finance' }],
  settings: [{ label: 'Users', href: '/admin/users' }],
};

export default function AdminShell({ user, active, dashboard = 'overview', limited = false, children }: { user: string; active: string; dashboard?: string; limited?: boolean; children: React.ReactNode }) {
  const activeModule = active === 'clients' ? 'sales' : active === 'users' ? 'settings' : active;
  const links = sidebar[activeModule] || [];
  const productKeys = ['website', 'seo', 'content', 'custom', 'erp'];
  return <div className="admin-app"><header className="admin-top admin-top-modules"><Link className="admin-logo" href={limited ? '/admin/tasks' : '/admin'}><b>T<span>.</span></b> trilancers<span>.</span></Link><nav className="module-nav" aria-label="Admin modules">{modules.filter(item => !limited || item.key === 'tasks').map(item => <Link key={item.key} href={item.href} className={item.key === activeModule ? 'selected' : ''}>{item.name}</Link>)}</nav><div className="admin-account"><span>{user}</span><form action={signOut}><button>Sign out</button></form></div></header><div className="admin-layout"><aside className="admin-sidebar"><p>{modules.find(item => item.key === activeModule)?.name.toUpperCase() || 'WORKSPACE'}</p>{links.map((item, index) => {
    if (active === 'dashboard' && item.href === '/admin?dashboard=website') return <details className="sidebar-product" key="product" open={productKeys.includes(dashboard)}><summary>Product <span className="sidebar-chevron" aria-hidden="true" /></summary><div>{dashboards.filter(product => productKeys.includes(product.key)).map(product => <Link key={product.key} href={`/admin?dashboard=${product.key}`} className={dashboard === product.key ? 'active' : ''} aria-current={dashboard === product.key ? 'page' : undefined}>{product.name}</Link>)}</div></details>;
    if (active === 'dashboard' && productKeys.some(key => item.href === `/admin?dashboard=${key}`)) return null;
    return <Link key={item.href} className={(active === 'dashboard' ? item.href === (dashboard === 'overview' ? '/admin' : `/admin?dashboard=${dashboard}`) : active === 'clients' ? item.label === 'Clients' : index === 0) ? 'active' : ''} href={item.href}>{item.label === 'All tasks' && limited ? 'My tasks' : item.label}</Link>;
  })}</aside><main className="admin-main">{children}</main></div><nav className="admin-mobile-nav" aria-label="Admin navigation">{limited ? <><Link href="/admin/tasks">My tasks</Link><form action={signOut}><button>Sign out</button></form></> : <><Link href="/admin">Overview</Link><Link href="/admin/sales">Sales</Link><Link href="/admin/projects">Projects</Link><Link href="/admin/tasks">Tasks</Link><details className="mobile-more"><summary>More</summary><div>{modules.filter(item => ['marketing', 'finance', 'reports', 'team', 'settings'].includes(item.key)).map(item => <Link key={item.key} href={item.href}>{item.name}</Link>)}<form action={signOut}><button>Sign out</button></form></div></details></>}</nav></div>;
}
