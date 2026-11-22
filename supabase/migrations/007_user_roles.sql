-- Apply after 006_lead_table.sql.
begin;
alter table public.erp_members add column if not exists display_name text;
alter table public.erp_members drop constraint if exists erp_members_role_check;
update public.erp_members set role = 'sales_executive' where role = 'sales';
alter table public.erp_members add constraint erp_members_role_check check (role in (
  'founder', 'admin', 'sales_executive', 'sales_manager',
  'junior_website_developer', 'senior_website_developer',
  'junior_seo_executive', 'senior_seo_executive',
  'junior_content_writer', 'senior_content_writer',
  'junior_marketing_executive', 'senior_marketing_executive'
));

drop policy if exists "Founders can read enquiries" on public.contact_submissions;
create policy "Founders can read enquiries" on public.contact_submissions for select to authenticated
  using (exists (select 1 from public.erp_members where user_id = (select auth.uid()) and role in ('founder', 'admin') and active));

do $$
declare table_name text;
begin
  foreach table_name in array array['erp_leads','erp_clients','erp_projects','erp_tasks','erp_expenses'] loop
    execute format('drop policy if exists "Founder access" on public.%I', table_name);
    execute format('create policy "Founder access" on public.%I for all to authenticated using (exists (select 1 from public.erp_members where user_id = (select auth.uid()) and role in (''founder'', ''admin'') and active)) with check (exists (select 1 from public.erp_members where user_id = (select auth.uid()) and role in (''founder'', ''admin'') and active))', table_name);
  end loop;
end $$;
commit;
