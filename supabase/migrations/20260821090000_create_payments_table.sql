-- Phase 10 — Payments
-- Creates the "payments" table exactly as specified in CRM_Blueprint_v2.md
-- (Section 3, "payments" table). Every payment belongs to exactly one
-- invoice (not nullable, on delete cascade — same required-relationship
-- pattern used throughout). Note: the frozen schema uses "paid_at" (not
-- "payment_date") and has no "reference" column. Does not modify any
-- previous migration.

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  amount numeric(12, 2) not null,
  payment_method text not null,
  paid_at date not null,
  notes text,
  created_at timestamptz not null default now(),

  constraint payments_amount_positive
    check (amount > 0),
  constraint payments_method_check
    check (payment_method in ('bank_transfer', 'cash', 'stripe', 'paypal', 'other'))
);

create index if not exists payments_invoice_id_idx on public.payments (invoice_id);
create index if not exists payments_paid_at_idx on public.payments (paid_at desc);
create index if not exists payments_created_at_idx on public.payments (created_at desc);

alter table public.payments enable row level security;

create policy "Authenticated users can view payments"
  on public.payments for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert payments"
  on public.payments for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update payments"
  on public.payments for update
  using (auth.role() = 'authenticated');

create policy "Authenticated users can delete payments"
  on public.payments for delete
  using (auth.role() = 'authenticated');