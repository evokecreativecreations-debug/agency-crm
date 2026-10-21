-- Fresh installs need leads before clients and projects. Preserve the existing
-- 20260818120000 migration version for databases that already applied it.
-- That later migration adds the indexes and policies as before.
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid references public.inquiries(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  notes text,
  status text not null default 'contacted',
  created_at timestamptz not null default now(),
  constraint leads_status_check
    check (status in ('contacted', 'negotiating', 'won', 'lost'))
);
alter table public.leads enable row level security;
