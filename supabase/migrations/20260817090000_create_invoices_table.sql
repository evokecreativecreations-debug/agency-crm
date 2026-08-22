-- Phase 7 — Invoices
-- Creates the "invoices" table exactly as specified in CRM_Blueprint_v2.md
-- (Section 3, "invoices" table). Every invoice belongs to exactly one
-- project (not nullable — same required-relationship pattern as
-- projects.client_id from Phase 6). Does not modify any previous
-- migration.

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  invoice_number text not null unique,
  amount numeric(12, 2) not null,
  status text not null default 'draft',
  due_date date,
  created_at timestamptz not null default now(),

  constraint invoices_status_check
    check (status in ('draft', 'sent', 'partially_paid', 'paid', 'overdue')),
  constraint invoices_amount_positive
    check (amount >= 0)
);

-- Indexed for fast dashboard filtering (see Blueprint v2, Section 3.2)
-- and for looking up all invoices belonging to a project.
create index if not exists invoices_project_id_idx on public.invoices (project_id);
create index if not exists invoices_status_idx on public.invoices (status);
create index if not exists invoices_created_at_idx on public.invoices (created_at desc);

-- Row Level Security: same pattern as every previous module — only
-- signed-in agency team members can read or write invoices. No public
-- policy.
alter table public.invoices enable row level security;

create policy "Authenticated users can view invoices"
  on public.invoices for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert invoices"
  on public.invoices for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update invoices"
  on public.invoices for update
  using (auth.role() = 'authenticated');

-- No delete policy — same reasoning as previous modules: invoices are
-- never deleted through the app for now. Can be added later if you ask
-- for it.