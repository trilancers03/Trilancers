"use client";

import { useRouter } from 'next/navigation';
import { useRef, useState, type FormEvent } from 'react';

export default function Contact() {
  const router = useRouter();
  const submitting = useRef(false);
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    const form = event.currentTarget;
    const data = new FormData(form);
    setSending(true);
    setStatus('');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.get('name'), phone: data.get('phone'), service: data.get('service'), message: data.get('message') }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to send your message. Please try again.');
      router.replace('/thank-you');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to send your message. Please try again.');
      submitting.current = false;
      setSending(false);
    }
  }

  return <main><section className="contact-page section-pad"><div className="contact-layout"><div><div className="section-label"><span aria-hidden="true">✳</span> CONTACT TRILANCERS</div><h1>Let’s make<br/><em>something great.</em></h1><p>Have a project in mind? Tell us a little about it and let’s start a conversation.</p></div><form className="contact-form" onSubmit={submit}><h2>Tell us about your project</h2><div className="form-grid"><label>Full name<input name="name" autoComplete="name" maxLength={120} required placeholder="Your full name" /></label><label>Phone number<input name="phone" type="tel" autoComplete="tel" maxLength={30} required placeholder="Your phone number" /></label></div><label>Service<select name="service" required defaultValue=""><option value="" disabled>Select a service</option><option>Website</option><option>SEO</option><option>Content Writing</option><option>Custom Solutions</option><option>ERP&apos;s</option></select></label><label>Message <span className="optional">(optional)</span><textarea name="message" rows={5} maxLength={5000} placeholder="Tell us more about your project" /></label><button className="button button-light form-submit" type="submit" disabled={sending}>{sending ? 'Processing…' : 'Send message'}</button><p className="form-status" role="status" aria-live="polite">{status}</p></form></div></section></main>;
}
