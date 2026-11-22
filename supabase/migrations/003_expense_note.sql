-- Apply after 002_erp_workflows.sql. Existing expenses retain an empty note.
alter table public.erp_expenses add column if not exists note text;
