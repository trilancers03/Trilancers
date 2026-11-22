-- Apply after 007_user_roles.sql. Existing tasks remain unassigned.
begin;
alter table public.erp_tasks add column if not exists assignee_id uuid references public.erp_members(user_id);
alter table public.erp_tasks add column if not exists details text check (length(details) <= 2000);
create index if not exists erp_tasks_assignee_idx on public.erp_tasks (assignee_id, created_at desc);

-- Members can read their own tasks and update their status, while administrators
-- retain access through the existing Founder access policy.
drop policy if exists "Members read assigned tasks" on public.erp_tasks;
create policy "Members read assigned tasks" on public.erp_tasks for select to authenticated
  using (assignee_id = (select auth.uid()) and exists (select 1 from public.erp_members where user_id = (select auth.uid()) and active));
drop policy if exists "Members update assigned task status" on public.erp_tasks;
create policy "Members update assigned task status" on public.erp_tasks for update to authenticated
  using (assignee_id = (select auth.uid()) and exists (select 1 from public.erp_members where user_id = (select auth.uid()) and active))
  with check (assignee_id = (select auth.uid()) and exists (select 1 from public.erp_members where user_id = (select auth.uid()) and active));
revoke update on public.erp_tasks from authenticated;
grant update (status) on public.erp_tasks to authenticated;

-- Assignment and creation are restricted to active founders/admins even when
-- these functions are called directly through the API.
create or replace function public.erp_create_general_task(p_title text, p_due_date date, p_assignee_id uuid, p_details text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare new_id uuid;
begin
  if not exists (select 1 from public.erp_members where user_id = auth.uid() and active and role in ('founder', 'admin')) then
    raise exception 'Access denied' using errcode = '42501';
  end if;
  if p_assignee_id is not null and not exists (select 1 from public.erp_members where user_id = p_assignee_id and active) then
    raise exception 'Assignee is unavailable' using errcode = '23503';
  end if;
  insert into public.erp_tasks (title, due_date, assignee_id, details, created_by)
  values (p_title, p_due_date, p_assignee_id, nullif(trim(p_details), ''), auth.uid()) returning id into new_id;
  return new_id;
end $$;

create or replace function public.erp_assign_task(p_task_id uuid, p_assignee_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.erp_members where user_id = auth.uid() and active and role in ('founder', 'admin')) then
    raise exception 'Access denied' using errcode = '42501';
  end if;
  if p_assignee_id is not null and not exists (select 1 from public.erp_members where user_id = p_assignee_id and active) then
    raise exception 'Assignee is unavailable' using errcode = '23503';
  end if;
  update public.erp_tasks set assignee_id = p_assignee_id where id = p_task_id;
  if not found then raise exception 'Task not found' using errcode = 'P0002'; end if;
end $$;
create or replace function public.erp_assignable_members()
returns table (user_id uuid, display_name text) language plpgsql stable security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.erp_members m where m.user_id = auth.uid() and m.active and m.role in ('founder', 'admin')) then
    raise exception 'Access denied' using errcode = '42501';
  end if;
  return query select m.user_id, m.display_name from public.erp_members m where m.active order by m.display_name nulls last, m.user_id;
end $$;
revoke all on function public.erp_create_general_task(text, date, uuid, text) from public;
revoke all on function public.erp_assign_task(uuid, uuid) from public;
revoke all on function public.erp_assignable_members() from public;
grant execute on function public.erp_create_general_task(text, date, uuid, text) to authenticated;
grant execute on function public.erp_assign_task(uuid, uuid) to authenticated;
grant execute on function public.erp_assignable_members() to authenticated;
commit;
