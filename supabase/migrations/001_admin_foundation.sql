-- Run in the Supabase SQL Editor. Create the first user in Authentication first.
create table if not exists public.erp_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('founder', 'sales')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.erp_members enable row level security;
grant select on public.erp_members to authenticated;
drop policy if exists "Members can read own membership" on public.erp_members;
create policy "Members can read own membership" on public.erp_members
  for select to authenticated using (user_id = (select auth.uid()) and active);

-- Only founders can see enquiries until record-level assignment is implemented.
alter table public.contact_submissions enable row level security;
grant select on public.contact_submissions to authenticated;
drop policy if exists "Founders can read enquiries" on public.contact_submissions;
create policy "Founders can read enquiries" on public.contact_submissions
  for select to authenticated using (
    exists (select 1 from public.erp_members where user_id = (select auth.uid()) and role = 'founder' and active)
  );

-- After creating your first Auth user, replace the UUID and run this separately:
-- insert into public.erp_members (user_id, role) values ('YOUR_AUTH_USER_UUID', 'founder');
