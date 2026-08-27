create table if not exists public.gmail_connections (
  id uuid primary key default gen_random_uuid(),

  email text not null unique,

  access_token text not null,
  refresh_token text,
  expiry_date timestamptz,

  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gmail_connections_email_idx
on public.gmail_connections(email);