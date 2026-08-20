-- Phase 7 — Tasks
-- Creates the "tasks" table exactly as specified in CRM_Blueprint_v2.md
-- (Section 3, "tasks" table). Every task belongs to exactly one project
-- (not nullable, on delete cascade — same required-relationship pattern
-- as projects.client_id from Phase 6). Note: the frozen schema has no
-- "priority" or "updated_at" column — only what's listed below. Does not
-- modify any previous migration.

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo',
  assigned_to uuid references auth.users(id) on delete set null,
  due_date date,
  created_at timestamptz not null default now(),

  constraint tasks_status_check
    check (status in ('todo', 'in_progress', 'done'))
);

-- Indexed for looking up all tasks belonging to a project, for status
-- filtering (same pattern as every other status column), and for a
-- future "upcoming deadlines" dashboard widget (Blueprint v2, Section 7.1).
create index if not exists tasks_project_id_idx on public.tasks (project_id);
create index if not exists tasks_status_idx on public.tasks (status);
create index if not exists tasks_due_date_idx on public.tasks (due_date);
create index if not exists tasks_created_at_idx on public.tasks (created_at desc);

-- Row Level Security: same pattern as every previous module — only
-- signed-in agency team members can read or write tasks. No public
-- policy. (assigned_to is present for future team-member assignment,
-- per the blueprint's "future: team members" note, but nothing in this
-- phase writes to it yet.)
alter table public.tasks enable row level security;

create policy "Authenticated users can view tasks"
  on public.tasks for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert tasks"
  on public.tasks for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update tasks"
  on public.tasks for update
  using (auth.role() = 'authenticated');

-- No delete policy — the blueprint doesn't specify task deletion, same
-- reasoning as every previous module. Can be added later if you ask.