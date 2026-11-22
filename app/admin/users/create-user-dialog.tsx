'use client';

import { useRef } from 'react';
import { userRoles } from '../user-roles';
import { createUser } from './actions';
import PasswordField from '../password-field';

export default function CreateUserDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  return <><button type="button" className="admin-outline dialog-trigger" onClick={() => dialog.current?.showModal()}>Add user</button><dialog ref={dialog} className="create-dialog" aria-labelledby="new-user-title"><div className="dialog-header"><div><p className="admin-kicker">USER MANAGEMENT</p><h2 id="new-user-title">Add user</h2><p>Create an account and choose its role.</p></div><button type="button" className="dialog-close" aria-label="Close" onClick={() => dialog.current?.close()}>×</button></div><form action={createUser} className="module-create dialog-form"><label>Full name<input name="name" required maxLength={120} autoComplete="off"/></label><label>Work email<input name="email" type="email" required maxLength={254} autoComplete="off"/></label><label>Role<select name="role" required defaultValue=""><option value="" disabled>Select a role</option>{userRoles.map(role => <option key={role.value} value={role.value}>{role.label}</option>)}</select></label><PasswordField label="Initial password" autoComplete="new-password" minLength={12} maxLength={72}/><p className="user-password-help">Use at least 12 characters. Share the initial password securely with the user.</p><div className="dialog-actions"><button type="button" className="admin-outline" onClick={() => dialog.current?.close()}>Cancel</button><button className="admin-primary" type="submit">Create user</button></div></form></dialog></>;
}
