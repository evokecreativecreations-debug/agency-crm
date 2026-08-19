-- Phase 5 — Clients
-- Creates the "clients" table exactly as specified in CRM_Blueprint_v2.md
-- (Section 3, "clients" table). A client can optionally trace back to
-- the lead it was converted from (lead_id) or be added directly — the
-- column is nullable to support both paths, matching the blueprint's ER
-- diagram. Note: clients have no "status" column in the frozen schema.

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  full_name text not null,
  company_name text,
  email text not null,
  phone text,
  notes text,
  created_at timestamptz not null default now(),

  -- Prevents the same lead from being converted into more than one
  -- client. A standard UNIQUE constraint allows multiple NULLs, so
  -- clients added directly (no lead_id) are unaffected.
  constraint clients_lead_id_unique unique (lead_id)
);

-- Indexed for lookups by originating lead, and for the dashboard's
-- default newest-first ordering (see Blueprint v2, Section 3.2).
create index if not exists clients_lead_id_idx on public.clients (lead_id);
create index if not exists clients_created_at_idx on public.clients (created_at desc);

-- Row Level Security: same pattern as "inquiries" and "leads" — only
-- signed-in agency team members can read or write clients. No public
-- policy; clients are never created by the public website directly.
alter table public.clients enable row level security;

create policy "Authenticated users can view clients"
  on public.clients for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert clients"
  on public.clients for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update clients"
  on public.clients for update
  using (auth.role() = 'authenticated');

-- No delete policy — same reasoning as "inquiries" and "leads": clients
-- are never deleted through the app for now. Can be added later if you
-- ask for it.