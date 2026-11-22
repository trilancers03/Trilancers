'use client';

import { useRef } from 'react';
import { editTask } from './actions';

export default function EditTaskDialog({ id, title, details, dueDate, view, page }: { id: string; title: string; details?: string | null; dueDate?: string | null; view: string; page: number }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return <><button type="button" className="task-edit-button" onClick={() => dialog.current?.showModal()}>Edit</button><dialog ref={dialog} className="create-dialog" aria-labelledby={`edit-task-${id}`}><div className="dialog-header"><div><p className="admin-kicker">TASKS</p><h2 id={`edit-task-${id}`}>Edit task</h2><p>Update the task details.</p></div><button type="button" className="dialog-close" aria-label="Close" onClick={() => dialog.current?.close()}>×</button></div><form action={editTask} className="module-create dialog-form"><input type="hidden" name="id" value={id}/><input type="hidden" name="view" value={view}/><input type="hidden" name="page" value={page}/><label>Task title<input name="title" required maxLength={160} defaultValue={title}/></label><label>Due date<input type="date" name="due_date" defaultValue={dueDate || ''}/></label><label>Details (optional)<textarea name="details" rows={4} maxLength={2000} defaultValue={details || ''}/></label><div className="dialog-actions"><button type="button" className="admin-outline" onClick={() => dialog.current?.close()}>Cancel</button><button type="submit" className="admin-primary">Save changes</button></div></form></dialog></>;
}
