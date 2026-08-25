-- Phase 12 — Activity Log
-- A shared, append-only audit trail for the CRM. Future Notifications,
-- Messages, Dashboard Activity, and Client Timeline all read this table.

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  description text not null,
  performed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_entity_idx
  on public.activity_logs (entity_type, entity_id, created_at desc);
create index if not exists activity_logs_created_at_idx
  on public.activity_logs (created_at desc);

alter table public.activity_logs enable row level security;

create policy "Authenticated users can view activity logs"
  on public.activity_logs for select
  using (auth.role() = 'authenticated');

-- The table has no direct client insert/update/delete policies. Rows are
-- written only by the database trigger below, which keeps the audit log
-- append-only and prevents a browser from forging or editing history.
create or replace function public.write_activity_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  row_data jsonb;
  previous_data jsonb;
  log_entity_type text;
  log_entity_id uuid;
  log_action text;
  log_description text;
  record_label text;
begin
  row_data := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  previous_data := case when tg_op = 'INSERT' then null else to_jsonb(old) end;
  record_label := replace(tg_table_name, '_', ' ');

  if tg_table_name = 'payments' then
    log_entity_type := 'invoice';
    log_entity_id := (row_data ->> 'invoice_id')::uuid;
  else
    log_entity_type := case tg_table_name
      when 'inquiries' then 'inquiry'
      when 'leads' then 'lead'
      when 'clients' then 'client'
      when 'projects' then 'project'
      when 'tasks' then 'task'
      when 'revisions' then 'revision'
      when 'invoices' then 'invoice'
      when 'services' then 'service'
    end;
    log_entity_id := (row_data ->> 'id')::uuid;
  end if;

  if tg_op = 'INSERT' then
    if tg_table_name = 'payments' then
      log_action := 'payment_recorded';
      log_description := 'Payment recorded.';
    else
      log_action := 'created';
      log_description := initcap(record_label) || ' created.';
    end if;
  elsif tg_op = 'DELETE' then
    log_action := 'deleted';
    log_description := initcap(record_label) || ' deleted.';
  elsif row_data ? 'status' and (previous_data ->> 'status') is distinct from (row_data ->> 'status') then
    log_action := 'status_changed';
    log_description := 'Status changed from ' || coalesce(previous_data ->> 'status', 'none') || ' to ' || coalesce(row_data ->> 'status', 'none') || '.';
  else
    log_action := 'updated';
    log_description := initcap(record_label) || ' updated.';
  end if;

  insert into public.activity_logs (entity_type, entity_id, action, description, performed_by)
  values (log_entity_type, log_entity_id, log_action, log_description, auth.uid());

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger activity_log_inquiries
  after insert or update on public.inquiries
  for each row execute function public.write_activity_log();
create trigger activity_log_leads
  after insert or update on public.leads
  for each row execute function public.write_activity_log();
create trigger activity_log_clients
  after insert or update on public.clients
  for each row execute function public.write_activity_log();
create trigger activity_log_projects
  after insert or update on public.projects
  for each row execute function public.write_activity_log();
create trigger activity_log_tasks
  after insert or update on public.tasks
  for each row execute function public.write_activity_log();
create trigger activity_log_revisions
  after insert or update on public.revisions
  for each row execute function public.write_activity_log();
create trigger activity_log_invoices
  after insert or update on public.invoices
  for each row execute function public.write_activity_log();
create trigger activity_log_payments
  after insert or update or delete on public.payments
  for each row execute function public.write_activity_log();
create trigger activity_log_services
  after insert or update on public.services
  for each row execute function public.write_activity_log();
