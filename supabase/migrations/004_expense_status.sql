-- Apply after 003_expense_note.sql. Existing expenses keep an unspecified status.
alter table public.erp_expenses
  add column if not exists status text not null default 'Unspecified'
  check (status in ('Unspecified', 'Pending', 'Paid'));
