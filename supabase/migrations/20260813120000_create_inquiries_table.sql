-- Phase 3 — Inquiries
-- Creates the "inquiries" table exactly as specified in CRM_Blueprint_v2.md
-- (Section 3, "inquiries" table). This is the first table in the schema —
-- it has no foreign keys yet (leads.inquiry_id will reference this table
-- once the Leads migration is added in Phase 4).

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  message text not null,
  source text not null default 'manual',
  status text not null default 'new',
  created_at timestamptz not null default now(),

  constraint inquiries_status_check
    check (status in ('new', 'reviewed', 'converted_to_lead', 'discarded')),
  constraint inquiries_source_check
    check (source in ('website_form', 'manual'))
);

-- Indexed for fast dashboard filtering (see Blueprint v2, Section 3.2).
create index if not exists inquiries_status_idx on public.inquiries (status);
create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);

-- Row Level Security: only signed-in agency team members can read or
-- write inquiries through the normal Supabase client. The public website
-- contact form does NOT get its own RLS policy — it goes through the
-- /api/inquiries route, which uses the service-role key (server-only,
-- bypasses RLS) after checking a shared secret. This keeps inquiries
-- fully private by default with no public read/write policy at all.
alter table public.inquiries enable row level security;

create policy "Authenticated users can view inquiries"
  on public.inquiries for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert inquiries"
  on public.inquiries for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update inquiries"
  on public.inquiries for update
  using (auth.role() = 'authenticated');

-- No delete policy — inquiries are never deleted through the app for now.
-- This can be added later if you explicitly ask for it.