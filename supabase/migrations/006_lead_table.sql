-- Apply after 005_lead_stages.sql. Existing leads retain unknown values.
alter table public.erp_leads add column if not exists source text;
alter table public.erp_leads add column if not exists priority text check (priority in ('Low', 'Medium', 'High'));
alter table public.erp_leads add column if not exists estimated_value numeric(12,2) check (estimated_value >= 0);
alter table public.erp_leads add column if not exists owner_id uuid references auth.users(id);
alter table public.erp_leads add column if not exists last_contact_at date;
