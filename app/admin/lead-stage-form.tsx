'use client';

import { useState } from 'react';
import { updateStatus } from './actions';
import { leadStages } from './modules';

export default function LeadStageForm({ id, name, stage, previousStage, followUp, closingPrice }: { id: string; name: string; stage: string; previousStage?: string | null; followUp?: string | null; closingPrice?: number | null }) {
  const [selected, setSelected] = useState(stage);
  return <form action={updateStatus} className="lead-stage-form"><input type="hidden" name="module" value="sales"/><input type="hidden" name="id" value={id}/><label>Lead stage<select name="status" value={selected} onChange={event => setSelected(event.target.value)} aria-label={`Lead stage for ${name}`}>
    {stage === 'Legacy' && <option value="Legacy" disabled>Previous: {previousStage || 'Review required'}</option>}
    {leadStages.map(item => <option key={item}>{item}</option>)}
  </select></label>{selected === 'Follow Up' && <label>Follow-up date<input name="next_follow_up_at" type="date" required defaultValue={followUp || ''}/></label>}{selected === 'Closed' && <label>Closing price (INR)<input name="closing_price" type="number" min="0.01" max="9999999999.99" step="0.01" required defaultValue={closingPrice ?? ''}/></label>}<button type="submit" disabled={selected === 'Legacy'}>Save</button></form>;
}
