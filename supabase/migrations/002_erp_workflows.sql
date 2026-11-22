-- Apply after 001_admin_foundation.sql. Existing website enquiries remain intact.
create table if not exists public.erp_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 120),
  company text,
  phone text,
  service text not null check (service in ('Website', 'SEO', 'Content Writing', 'Custom Solutions', 'ERP')),
  stage text not null default 'New Enquiry' check (stage in ('New Enquiry', 'Assigned', 'Contact Attempted', 'Connected', 'Qualified Prospect', 'Discovery / Meeting', 'Proposal Drafting', 'Proposal Sent', 'Negotiation', 'Won', 'Lost', 'On Hold')),
  next_follow_up_at date,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists erp_leads_stage_idx on public.erp_leads (stage, created_at desc);
create table if not exists public.erp_clients (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 120),
  email text,
  phone text,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);
create table if not exists public.erp_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) between 1 and 160),
  client_id uuid references public.erp_clients(id),
  service text not null check (service in ('Website', 'SEO', 'Content Writing', 'Custom Solutions', 'ERP')),
  status text not null default 'Planned' check (status in ('Draft', 'Planned', 'Active', 'Blocked', 'Client Review', 'On Hold', 'Completed', 'Cancelled', 'Archived')),
  due_date date,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);
create table if not exists public.erp_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) between 1 and 160),
  project_id uuid references public.erp_projects(id),
  status text not null default 'To do' check (status in ('To do', 'In progress', 'Done')),
  due_date date,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);
create table if not exists public.erp_expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null check (length(trim(description)) between 1 and 160),
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'INR' check (currency = 'INR'),
  expense_date date not null default current_date,
  project_id uuid references public.erp_projects(id),
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);

-- Founder-only access until record-level assignments and other roles are implemented.
do $$
declare table_name text;
begin
  foreach table_name in array array['erp_leads','erp_clients','erp_projects','erp_tasks','erp_expenses'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('grant select, insert, update on public.%I to authenticated', table_name);
    execute format('drop policy if exists "Founder access" on public.%I', table_name);
    execute format('create policy "Founder access" on public.%I for all to authenticated using (exists (select 1 from public.erp_members where user_id = (select auth.uid()) and role = ''founder'' and active)) with check (exists (select 1 from public.erp_members where user_id = (select auth.uid()) and role = ''founder'' and active))', table_name);
  end loop;
end $$;
