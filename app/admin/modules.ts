export const moduleDefinitions = {
  sales: { title: 'All leads', section: 'Sales CRM', table: 'erp_leads', noun: 'lead', fields: ['name', 'company', 'phone', 'service', 'source', 'priority', 'estimated_value', 'last_contact_at'] },
  clients: { title: 'Clients', section: 'Sales CRM', table: 'erp_clients', noun: 'client', fields: ['name', 'email', 'phone'] },
  projects: { title: 'All projects', section: 'Projects', table: 'erp_projects', noun: 'project', fields: ['title', 'service', 'due_date'] },
  tasks: { title: 'Tasks & my work', section: 'Projects', table: 'erp_tasks', noun: 'task', fields: ['title', 'due_date'] },
  finance: { title: 'Expenses', section: 'Finance', table: 'erp_expenses', noun: 'expense', fields: ['description', 'amount', 'expense_date', 'note'] },
} as const;
export type ModuleKey = keyof typeof moduleDefinitions;
export const services = ['Website', 'SEO', 'Content Writing', 'Custom Solutions', 'ERP'];
export const leadStages = ['Fresh', 'Pitched', 'Prospect', 'Suspect', 'Quotation', 'Quotation Sent', 'Follow Up', 'Closed', 'Hot Lead'];
export const boardStatuses = {
  tasks: ['To do', 'In progress', 'Done'],
  finance: ['Unspecified', 'Pending', 'Paid'],
};
