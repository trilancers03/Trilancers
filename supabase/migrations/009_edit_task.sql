-- Apply after 008_general_tasks.sql.
create or replace function public.erp_edit_general_task(p_task_id uuid, p_title text, p_due_date date, p_details text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.erp_members where user_id = auth.uid() and active and role in ('founder', 'admin')) then
    raise exception 'Access denied' using errcode = '42501';
  end if;
  if p_title is null or length(trim(p_title)) not between 1 and 160 or length(coalesce(p_details, '')) > 2000 then
    raise exception 'Invalid task details' using errcode = '22023';
  end if;
  update public.erp_tasks set title = trim(p_title), due_date = p_due_date, details = nullif(trim(p_details), '') where id = p_task_id;
  if not found then raise exception 'Task not found' using errcode = 'P0002'; end if;
end $$;
revoke all on function public.erp_edit_general_task(uuid, text, date, text) from public;
grant execute on function public.erp_edit_general_task(uuid, text, date, text) to authenticated;
