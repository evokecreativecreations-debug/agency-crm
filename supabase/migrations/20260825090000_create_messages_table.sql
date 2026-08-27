-- Phase 14 — Messages
-- Conversation and email message history for the CRM.
-- Outbound messages are sent through Resend.
-- Gmail message/thread identifiers are stored for mailbox synchronization.

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),

  client_id uuid references public.clients(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,

  subject text not null,

  participant_email text not null,
  participant_name text,

  gmail_thread_id text,

  last_message_at timestamptz not null default now(),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists conversations_client_id_idx
  on public.conversations (client_id);

create index if not exists conversations_lead_id_idx
  on public.conversations (lead_id);

create index if not exists conversations_participant_email_idx
  on public.conversations (participant_email);

create index if not exists conversations_last_message_at_idx
  on public.conversations (last_message_at desc);

create unique index if not exists conversations_gmail_thread_id_idx
  on public.conversations (gmail_thread_id)
  where gmail_thread_id is not null;


create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),

  conversation_id uuid not null
    references public.conversations(id)
    on delete cascade,

  sender_email text not null,
  sender_name text,

  recipient_email text not null,
  recipient_name text,

  subject text not null,

  body_text text not null,
  body_html text,

  direction text not null default 'outbound',

  status text not null default 'sent',

  gmail_message_id text,
  gmail_thread_id text,
  resend_email_id text,

  sent_at timestamptz not null default now(),

  created_at timestamptz not null default now(),

  constraint messages_direction_check
    check (direction in ('inbound', 'outbound')),

  constraint messages_status_check
    check (
      status in (
        'draft',
        'queued',
        'sent',
        'delivered',
        'failed'
      )
    )
);

create index if not exists messages_conversation_id_idx
  on public.messages (conversation_id, sent_at asc);

create index if not exists messages_sender_email_idx
  on public.messages (sender_email);

create index if not exists messages_recipient_email_idx
  on public.messages (recipient_email);

create index if not exists messages_sent_at_idx
  on public.messages (sent_at desc);

create unique index if not exists messages_gmail_message_id_idx
  on public.messages (gmail_message_id)
  where gmail_message_id is not null;

create unique index if not exists messages_resend_email_id_idx
  on public.messages (resend_email_id)
  where resend_email_id is not null;


alter table public.conversations enable row level security;

alter table public.messages enable row level security;


create policy "Authenticated users can view conversations"
  on public.conversations
  for select
  using (auth.role() = 'authenticated');


create policy "Authenticated users can insert conversations"
  on public.conversations
  for insert
  with check (auth.role() = 'authenticated');


create policy "Authenticated users can update conversations"
  on public.conversations
  for update
  using (auth.role() = 'authenticated');


create policy "Authenticated users can view messages"
  on public.messages
  for select
  using (auth.role() = 'authenticated');


create policy "Authenticated users can insert messages"
  on public.messages
  for insert
  with check (auth.role() = 'authenticated');


create policy "Authenticated users can update messages"
  on public.messages
  for update
  using (auth.role() = 'authenticated');