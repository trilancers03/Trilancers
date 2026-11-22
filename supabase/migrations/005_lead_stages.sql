-- Apply after 004_expense_status.sql.
-- Previous stage labels are retained for review rather than guessed into a new stage.
begin;
alter table public.erp_leads add column if not exists previous_stage text;
alter table public.erp_leads add column if not exists closing_price numeric(12,2);
alter table public.erp_leads drop constraint if exists erp_leads_stage_check;
update public.erp_leads set previous_stage = stage, stage = 'Legacy'
where stage not in ('Fresh', 'Pitched', 'Prospect', 'Suspect', 'Quotation', 'Quotation Sent', 'Follow Up', 'Closed', 'Hot Lead', 'Legacy');
alter table public.erp_leads alter column stage set default 'Fresh';
alter table public.erp_leads add constraint erp_leads_stage_check
  check (stage in ('Fresh', 'Pitched', 'Prospect', 'Suspect', 'Quotation', 'Quotation Sent', 'Follow Up', 'Closed', 'Hot Lead', 'Legacy'));
alter table public.erp_leads drop constraint if exists erp_leads_stage_details_check;
alter table public.erp_leads add constraint erp_leads_stage_details_check
  check ((stage <> 'Follow Up' or next_follow_up_at is not null)
    and (stage <> 'Closed' or (closing_price is not null and closing_price > 0)));

-- The caller's row-level permissions apply to the expense aggregate.
create or replace function public.erp_expense_total()
returns numeric language sql stable security invoker set search_path = ''
as $$ select coalesce(sum(amount), 0) from public.erp_expenses $$;
revoke all on function public.erp_expense_total() from public;
grant execute on function public.erp_expense_total() to authenticated;
commit;
