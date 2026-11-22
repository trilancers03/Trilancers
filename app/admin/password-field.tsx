'use client';

import { useEffect, useId, useRef, useState } from 'react';

export default function PasswordField({ label, autoComplete, minLength, maxLength }: { label: string; autoComplete: string; minLength?: number; maxLength?: number }) {
  const [visible, setVisible] = useState(false);
  const id = useId();
  const field = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const dialog = field.current?.closest('dialog');
    const hidePassword = () => setVisible(false);
    dialog?.addEventListener('close', hidePassword);
    return () => dialog?.removeEventListener('close', hidePassword);
  }, []);
  return <div className="password-field" ref={field}><label htmlFor={id}>{label}</label><div className="password-input-wrap"><input id={id} name="password" type={visible ? 'text' : 'password'} autoComplete={autoComplete} required minLength={minLength} maxLength={maxLength}/><button type="button" className="password-toggle" aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible} onClick={() => setVisible(current => !current)}><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="3"/>{visible && <path d="M4 4l16 16"/>}</svg></button></div></div>;
}
