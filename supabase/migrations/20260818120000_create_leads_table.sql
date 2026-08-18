-- Phase 4 — Leads
-- Creates the "leads" table exactly as specified in CRM_Blueprint_v2.md
-- (Section 3, "leads" table). A lead can optionally trace back to the
-- inquiry it came from (inquiry_id) or be added directly — the column is
-- nullable to support both paths, matching the blueprint's ER diagram.

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

-- Indexed for fast dashboard filtering (see Blueprint v2, Section 3.2)
-- and for looking up the lead created from a given inquiry.
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_inquiry_id_idx on public.leads (inquiry_id);
create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- Row Level Security: same pattern as "inquiries" — only signed-in agency
-- team members can read or write leads. No public policy; leads are
-- never created by the public website directly.
alter table public.leads enable row level security;

create policy "Authenticated users can view leads"
  on public.leads for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert leads"
  on public.leads for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update leads"
  on public.leads for update
  using (auth.role() = 'authenticated');

-- No delete policy — same reasoning as "inquiries": leads are never
-- deleted through the app for now. Can be added later if you ask for it.
