-- Phase 8 — Revisions
-- Creates the "revisions" table exactly as specified in CRM_Blueprint_v2.md
-- (Section 3, "revisions" table). Every revision belongs to exactly one
-- project (not nullable, on delete cascade — same required-relationship
-- pattern as tasks.project_id / projects.client_id). Does not modify any
-- previous migration.

create table if not exists public.revisions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  round_number integer not null,
  feedback text not null,
  status text not null default 'requested',
  created_at timestamptz not null default now(),

  constraint revisions_status_check
    check (status in ('requested', 'in_progress', 'resolved')),
  constraint revisions_round_number_positive
    check (round_number > 0),
  -- Round numbers are sequential per project (Revision 1, 2, 3...) — this
  -- also prevents two revisions in the same project ever colliding on
  -- the same round number.
  constraint revisions_project_round_unique unique (project_id, round_number)
);

-- Indexed for looking up all revisions belonging to a project (in
-- round-number order, for a chronological history view) and for status
-- filtering (same pattern as every other status column).
create index if not exists revisions_project_id_idx on public.revisions (project_id);
create index if not exists revisions_status_idx on public.revisions (status);
create index if not exists revisions_created_at_idx on public.revisions (created_at desc);

-- Row Level Security: same pattern as every previous module — only
-- signed-in agency team members can read or write revisions. No public
-- policy.
alter table public.revisions enable row level security;

create policy "Authenticated users can view revisions"
  on public.revisions for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert revisions"
  on public.revisions for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update revisions"
  on public.revisions for update
  using (auth.role() = 'authenticated');

-- No delete policy — same reasoning as every previous module: revisions
-- are never deleted through the app for now (a permanent revision
-- history is the whole point of this module). Can be added later if you
-- ask for it.