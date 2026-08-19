-- Phase 6 — Projects
-- Creates the "projects" table exactly as specified in CRM_Blueprint_v2.md
-- (Section 3, "projects" table). Unlike leads.inquiry_id or
-- clients.lead_id, client_id here is NOT nullable — the blueprint does
-- not mark it optional, so every project must belong to exactly one
-- client. Does not modify any previous migration.

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'planning',
  start_date date,
  due_date date,
  created_at timestamptz not null default now(),

  constraint projects_status_check
    check (status in ('planning', 'in_progress', 'in_revision', 'completed', 'on_hold'))
);

-- Indexed for fast dashboard filtering (see Blueprint v2, Section 3.2)
-- and for looking up all projects belonging to a client.
create index if not exists projects_client_id_idx on public.projects (client_id);
create index if not exists projects_status_idx on public.projects (status);
create index if not exists projects_created_at_idx on public.projects (created_at desc);

-- Row Level Security: same pattern as "inquiries", "leads", and
-- "clients" — only signed-in agency team members can read or write
-- projects. No public policy.
alter table public.projects enable row level security;

create policy "Authenticated users can view projects"
  on public.projects for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert projects"
  on public.projects for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update projects"
  on public.projects for update
  using (auth.role() = 'authenticated');

-- No delete policy — same reasoning as previous modules: projects are
-- never deleted through the app for now. Can be added later if you ask
-- for it. (Note: client_id uses "on delete cascade" so that IF a client
-- is ever deleted in the future, its projects go with it rather than
-- becoming orphaned — this only matters once client deletion exists.)