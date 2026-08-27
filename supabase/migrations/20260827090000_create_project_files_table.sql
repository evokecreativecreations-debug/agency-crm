begin;

create table if not exists public.project_files (
  id uuid primary key default gen_random_uuid(),

  project_id uuid not null
    references public.projects(id)
    on delete cascade,

  file_name text not null,

  storage_path text not null unique,

  mime_type text not null,

  file_size bigint not null
    check (file_size >= 0),

  uploaded_by uuid
    references auth.users(id)
    on delete set null,

  created_at timestamptz not null default now()
);

create index if not exists project_files_project_id_idx
  on public.project_files(project_id);

create index if not exists project_files_created_at_idx
  on public.project_files(created_at desc);

alter table public.project_files
  enable row level security;

create policy "Authenticated users can view project files"
on public.project_files
for select
to authenticated
using (true);

create policy "Authenticated users can insert project files"
on public.project_files
for insert
to authenticated
with check (true);

create policy "Authenticated users can update project files"
on public.project_files
for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can delete project files"
on public.project_files
for delete
to authenticated
using (true);

commit;