-- Phase 11 — Services Catalog
-- Creates the approved services catalog and attaches the optional service
-- template link to projects. This does not change any earlier migration.

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  default_price numeric(12, 2),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),

  constraint services_default_price_non_negative
    check (default_price is null or default_price >= 0)
);

create index if not exists services_active_idx on public.services (is_active);
create index if not exists services_created_at_idx on public.services (created_at desc);

alter table public.projects
  add column if not exists service_id uuid references public.services(id) on delete set null;

create index if not exists projects_service_id_idx on public.projects (service_id);

alter table public.services enable row level security;

create policy "Authenticated users can view services"
  on public.services for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert services"
  on public.services for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update services"
  on public.services for update
  using (auth.role() = 'authenticated');

-- Services are retired by setting is_active to false rather than deleted,
-- preserving the service linked to historical projects.
