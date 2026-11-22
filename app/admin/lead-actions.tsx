'use client';
import { useRef } from 'react';
import LeadStageForm from './lead-stage-form';

export type Lead = { id: string; name: string; company: string | null; phone: string | null; service: string; source: string | null; stage: string; previous_stage: string | null; priority: string | null; estimated_value: number | null; closing_price: number | null; owner_id: string | null; last_contact_at: string | null; next_follow_up_at: string | null; created_at: string };

export default function LeadActions({ lead, context }: { lead: Lead; context: 'desktop' | 'mobile' }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return <><button type="button" className="lead-open" onClick={() => dialog.current?.showModal()}>Open</button><dialog className="create-dialog lead-dialog" ref={dialog} aria-labelledby={`lead-${context}-${lead.id}`}><div className="dialog-header"><div><p className="admin-kicker">LEAD DETAILS</p><h2 id={`lead-${context}-${lead.id}`}>{lead.name}</h2><p>{lead.company || 'Company not specified'} · {lead.service}</p></div><button type="button" className="dialog-close" aria-label="Close" onClick={() => dialog.current?.close()}>×</button></div><div className="lead-dialog-content"><dl><div><dt>Lead ID</dt><dd>{lead.id}</dd></div><div><dt>Phone</dt><dd>{lead.phone ? <a href={`tel:${lead.phone}`}>{lead.phone}</a> : '—'}</dd></div><div><dt>Source</dt><dd>{lead.source || '—'}</dd></div><div><dt>Priority</dt><dd>{lead.priority || '—'}</dd></div><div><dt>Estimated value</dt><dd>{lead.estimated_value == null ? '—' : `₹${Number(lead.estimated_value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</dd></div></dl><LeadStageForm id={lead.id} name={lead.name} stage={lead.stage} previousStage={lead.previous_stage} followUp={lead.next_follow_up_at} closingPrice={lead.closing_price}/></div></dialog></>;
}
