'use client';

import { useRef } from 'react';
import { createRecord } from './actions';
import { moduleDefinitions, services } from './modules';

type DialogModule = 'sales' | 'projects' | 'finance' | 'tasks';
export type TaskAssignee = { user_id: string; display_name: string | null };

export default function CreateRecordDialog({ module, assignees = [] }: { module: DialogModule; assignees?: TaskAssignee[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const definition = moduleDefinitions[module];
  const labels: Record<string, string> = {
    name: 'Full name', company: 'Company', phone: 'Phone number', service: 'Service',
    title: module === 'tasks' ? 'Task title' : 'Project title', due_date: 'Due date', description: 'Description',
    amount: 'Amount (INR)', expense_date: 'Expense date', note: 'Expense note (optional)',
    source: 'Lead source (optional)', priority: 'Priority (optional)', estimated_value: 'Estimated deal value (INR, optional)', last_contact_at: 'Last contact date (optional)',
  };
  const required = ['name', 'title', 'service', 'description', 'amount', 'expense_date'];
  return <>
    <button type="button" className="admin-outline dialog-trigger" onClick={() => dialog.current?.showModal()}>Add {definition.noun}</button>
    <dialog ref={dialog} className="create-dialog" aria-labelledby={`create-${module}-title`}>
      <div className="dialog-header"><div><p className="admin-kicker">QUICK CREATE</p><h2 id={`create-${module}-title`}>New {definition.noun}</h2><p>Add the essential details to get started.</p></div><button type="button" className="dialog-close" aria-label="Close" onClick={() => dialog.current?.close()}>×</button></div>
      <form action={createRecord} className="module-create dialog-form"><input type="hidden" name="module" value={module}/>{definition.fields.map(field => <label key={field}>{labels[field]}{field === 'note' ? <textarea name="note" rows={4} maxLength={2000} placeholder="Add any details about this expense"/> : field === 'service' ? <select name={field} required defaultValue=""><option value="" disabled>Select a service</option>{services.map(service => <option key={service}>{service}</option>)}</select> : field === 'priority' ? <select name="priority" defaultValue=""><option value="">Not set</option><option>Low</option><option>Medium</option><option>High</option></select> : <input name={field} type={field.includes('date') || field.endsWith('_at') ? 'date' : field === 'amount' || field === 'estimated_value' ? 'number' : field === 'phone' ? 'tel' : 'text'} required={required.includes(field)} maxLength={field === 'amount' || field === 'estimated_value' ? undefined : 160} min={field === 'amount' ? '0.01' : field === 'estimated_value' ? '0' : undefined} max={field === 'amount' || field === 'estimated_value' ? '9999999999.99' : undefined} step={field === 'amount' || field === 'estimated_value' ? '0.01' : undefined}/>}</label>)}{module === 'tasks' && <><label>Assign to<select name="assignee_id" defaultValue=""><option value="">Unassigned</option>{assignees.map(person => <option key={person.user_id} value={person.user_id}>{person.display_name || `User ${person.user_id.slice(0, 8)}`}</option>)}</select></label><label>Details (optional)<textarea name="details" rows={4} maxLength={2000} placeholder="Describe the task"/></label></>}<div className="dialog-actions"><button type="button" className="admin-outline" onClick={() => dialog.current?.close()}>Cancel</button><button className="admin-primary" type="submit">Create {definition.noun}</button></div></form>
    </dialog>
  </>;
}
