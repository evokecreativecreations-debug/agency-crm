-- Phase 13 — Notifications
-- Creates the notifications table.
-- Every notification belongs to one authenticated CRM workspace/user.
-- This follows the same migration style as previous phases.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),

  title text not null,

  message text not null,

  type text not null default 'info',

  read boolean not null default false,

  link text,

  created_at timestamptz not null default now(),

  constraint notifications_type_check
    check (
      type in (
        'info',
        'success',
        'warning',
        'error'
      )
    )
);

create index if not exists notifications_created_at_idx
on public.notifications(created_at desc);

create index if not exists notifications_read_idx
on public.notifications(read);

create index if not exists notifications_type_idx
on public.notifications(type);

alter table public.notifications
enable row level security;

create policy "Authenticated users can view notifications"
on public.notifications
for select
using (auth.role() = 'authenticated');

create policy "Authenticated users can insert notifications"
on public.notifications
for insert
with check (auth.role() = 'authenticated');

create policy "Authenticated users can update notifications"
on public.notifications
for update
using (auth.role() = 'authenticated');