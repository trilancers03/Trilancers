const services = ['Website', 'SEO', 'Content Writing', 'Custom Solutions', "ERP's"];
const sitekey = '188c497a-c4ba-41da-acec-d856aed45ac2';

export async function POST(request: Request) {
  let data: Record<string, unknown>;
  try { data = await request.json(); } catch { return Response.json({ error: 'Please check your details and try again.' }, { status: 400 }); }
  if (!data || typeof data.name !== 'string' || !data.name.trim() || data.name.length > 120 || typeof data.phone !== 'string' || !data.phone.trim() || data.phone.length > 30 || typeof data.service !== 'string' || !services.includes(data.service) || typeof data.message !== 'string' || data.message.length > 5000 || typeof data.token !== 'string' || !data.token) {
    return Response.json({ error: 'Please check your details and complete the hCaptcha challenge.' }, { status: 400 });
  }
  const secret = process.env.HCAPTCHA_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;
  if (!secret || !supabaseUrl || !supabaseKey) return Response.json({ error: 'The contact form is temporarily unavailable. Please try again later.' }, { status: 503 });
  try {
    const verification = await fetch('https://api.hcaptcha.com/siteverify', { method: 'POST', body: new URLSearchParams({ secret, sitekey, response: data.token }), signal: AbortSignal.timeout(10000) });
    const result = await verification.json();
    if (!verification.ok || result.success !== true) return Response.json({ error: 'Verification failed. Please complete the challenge again.' }, { status: 400 });
    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await supabase.from('contact_submissions').insert({ name: data.name.trim(), phone: data.phone.trim(), service: data.service, message: data.message.trim() || null });
    if (error) throw error;
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'Unable to send your message. Please try again later.' }, { status: 502 });
  }
}
import { createClient } from '@supabase/supabase-js';

