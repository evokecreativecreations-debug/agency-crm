begin;

-- Personal reminders; agency leads remain shared under their existing policies.
alter table public.leads add column if not exists last_contacted_at timestamptz;
create table public.lead_followups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  action text not null check (length(trim(action)) between 1 and 500),
  due_at timestamptz not null,
  status text not null default 'pending' check(status in ('pending','done','cancelled')),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index lead_followups_due_idx on public.lead_followups(user_id,due_at) where status='pending';
alter table public.lead_followups enable row level security;
create policy "Own followups" on public.lead_followups for all to authenticated
  using(user_id=auth.uid()) with check(user_id=auth.uid());
grant select,insert,update,delete on public.lead_followups to authenticated;

alter table public.notifications add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.notifications add column if not exists followup_id uuid references public.lead_followups(id) on delete cascade;
alter table public.notifications add column if not exists reminder_due_at timestamptz;
create unique index notifications_followup_due_unique on public.notifications(followup_id,reminder_due_at);
drop policy if exists "Authenticated users can view notifications" on public.notifications;
drop policy if exists "Authenticated users can insert notifications" on public.notifications;
drop policy if exists "Authenticated users can update notifications" on public.notifications;
-- Existing notifications are shared legacy agency notices. New notices are personal.
create policy "Read own and legacy notices" on public.notifications for select to authenticated
  using(user_id=auth.uid() or user_id is null);
create policy "Insert own notices" on public.notifications for insert to authenticated
  with check(user_id=auth.uid() and (followup_id is null or exists(select 1 from public.lead_followups f where f.id=followup_id and f.user_id=auth.uid())));
create policy "Update own and legacy notices" on public.notifications for update to authenticated
  using(user_id=auth.uid() or user_id is null) with check(user_id=auth.uid() or user_id is null);
alter table public.notifications alter column user_id set default auth.uid();

-- Notification ownership and reminder identity cannot be changed through a client update.
create function public.preserve_notice_owner() returns trigger
language plpgsql set search_path=public,pg_temp as $$
begin
  if new.user_id is distinct from old.user_id or new.followup_id is distinct from old.followup_id
    or new.reminder_due_at is distinct from old.reminder_due_at then
    raise exception 'Notification owner and reminder identity cannot be changed';
  end if;
  return new;
end; $$;
create trigger preserve_notice_owner before update on public.notifications
  for each row execute function public.preserve_notice_owner();

create function public.collect_due_followups() returns integer
language plpgsql security invoker set search_path=public,pg_temp as $$
declare n integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  insert into public.notifications(title,message,type,link,user_id,followup_id,reminder_due_at)
    select 'Follow-up due',l.full_name || ': ' || f.action,'warning','/today',auth.uid(),f.id,f.due_at
    from public.lead_followups f join public.leads l on l.id=f.lead_id
    where f.user_id=auth.uid() and f.status='pending' and f.due_at<=now()
    on conflict(followup_id,reminder_due_at) do nothing;
  get diagnostics n=row_count;
  return n;
end; $$;
revoke all on function public.collect_due_followups() from public,anon;
grant execute on function public.collect_due_followups() to authenticated;

create function public.followup_changed() returns trigger
language plpgsql security invoker set search_path=public,pg_temp as $$
begin
  if new.status='done' then
    new.completed_at=coalesce(new.completed_at,now());
  else new.completed_at=null; end if;
  if new.status<>'pending' or new.due_at is distinct from old.due_at then
    update public.notifications set read=true where followup_id=new.id and user_id=auth.uid();
  end if;
  return new;
end; $$;
create trigger followup_changed before update on public.lead_followups
  for each row execute function public.followup_changed();

-- Shared billing fields. Old single-total invoices keep their amount and empty items.
alter table public.invoices
  add column if not exists line_items jsonb not null default '[]',
  add column if not exists discount_amount numeric(12,2) not null default 0,
  add column if not exists tax_rate numeric(5,2) not null default 0,
  add column if not exists deposit_amount numeric(12,2) not null default 0,
  add column if not exists notes text not null default '',
  add column if not exists payment_terms text not null default '',
  add column if not exists recipient_name text,
  add column if not exists recipient_email text;

create table public.quotations (
  id uuid primary key default gen_random_uuid(),
  quotation_number text not null unique,
  lead_id uuid references public.leads(id),
  client_id uuid references public.clients(id),
  recipient_name text not null,
  recipient_email text not null,
  line_items jsonb not null,
  discount_amount numeric(12,2) not null default 0,
  tax_rate numeric(5,2) not null default 0,
  deposit_amount numeric(12,2) not null default 0,
  amount numeric(12,2) not null,
  notes text not null default '',
  payment_terms text not null default '',
  valid_until date,
  status text not null default 'draft' check(status in ('draft','sent','accepted','declined','expired')),
  invoice_id uuid unique references public.invoices(id),
  created_at timestamptz not null default now(),
  check(num_nonnulls(lead_id,client_id)=1)
);
alter table public.quotations enable row level security;
create policy "Agency can read quotations" on public.quotations for select to authenticated using(auth.role()='authenticated');
create policy "Agency can create quotations" on public.quotations for insert to authenticated with check(auth.role()='authenticated');
create policy "Agency can edit quotations" on public.quotations for update to authenticated using(auth.role()='authenticated') with check(auth.role()='authenticated');
grant select,insert,update on public.quotations to authenticated;

create function public.billing_total(items jsonb, discount numeric, tax numeric, deposit numeric)
returns numeric language plpgsql immutable set search_path=public,pg_temp as $$
declare item jsonb; subtotal numeric=0; total numeric; qty numeric; price numeric;
begin
  if jsonb_typeof(items)<>'array' or jsonb_array_length(items) not between 1 and 100 then
    raise exception 'Add between 1 and 100 line items'; end if;
  for item in select * from jsonb_array_elements(items) loop
    if jsonb_typeof(item->'description') is distinct from 'string' or length(trim(item->>'description')) not between 1 and 1000
      or jsonb_typeof(item->'quantity') is distinct from 'number' or jsonb_typeof(item->'unit_price') is distinct from 'number' then
      raise exception 'Invalid line item'; end if;
    qty=(item->>'quantity')::numeric; price=(item->>'unit_price')::numeric;
    if qty<=0 or qty>1000000 or price<0 or price>1000000000 or qty<>round(qty,2) or price<>round(price,2) then
      raise exception 'Quantity and price must be valid numbers with up to two decimal places'; end if;
    subtotal=subtotal+round(qty*price,2);
  end loop;
  if discount is null or tax is null or deposit is null or discount<0 or discount>subtotal or tax<0 or tax>100 or deposit<0 then
    raise exception 'Invalid discount, tax or advance'; end if;
  total=round(subtotal-discount,2)+round((subtotal-discount)*tax/100,2);
  if total<=0 or total>9999999999.99 or deposit>total then raise exception 'Invalid total or advance exceeds total'; end if;
  return total;
end; $$;

create function public.prepare_billing_document() returns trigger
language plpgsql security invoker set search_path=public,pg_temp as $$
declare seq bigint; contact record; total_paid numeric;
begin
  if length(new.notes)>10000 or length(new.payment_terms)>5000 then raise exception 'Notes or payment terms too long'; end if;
  if tg_table_name='quotations' then
    if tg_op='UPDATE' and old.invoice_id is not null then
      if new is distinct from old then raise exception 'Converted quotations cannot be changed'; end if;
      return new;
    end if;
    if tg_op='INSERT' and new.invoice_id is not null then raise exception 'Use quotation conversion'; end if;
    new.amount=public.billing_total(new.line_items,new.discount_amount,new.tax_rate,new.deposit_amount);
    if tg_op='INSERT' or new.lead_id is distinct from old.lead_id or new.client_id is distinct from old.client_id then
      if new.client_id is not null then select full_name,email into contact from public.clients where id=new.client_id;
      else select full_name,email into contact from public.leads where id=new.lead_id; end if;
      if contact.full_name is null then raise exception 'Contact not found'; end if;
      new.recipient_name=contact.full_name; new.recipient_email=contact.email;
    elsif new.recipient_name is distinct from old.recipient_name or new.recipient_email is distinct from old.recipient_email then
      raise exception 'Change the linked contact to change the recipient';
    end if;
    if tg_op='UPDATE' and new.invoice_id is distinct from old.invoice_id and new.invoice_id is not null then
      if new.status<>'accepted' or not exists (
        select 1 from public.invoices i join public.projects p on p.id=i.project_id join public.clients c on c.id=p.client_id
        where i.id=new.invoice_id and i.line_items=new.line_items and i.amount=new.amount
          and i.discount_amount=new.discount_amount and i.tax_rate=new.tax_rate and i.deposit_amount=new.deposit_amount
          and i.notes=new.notes and i.payment_terms=new.payment_terms
          and ((new.client_id is not null and c.id=new.client_id) or (new.lead_id is not null and c.lead_id=new.lead_id))
      ) then raise exception 'Converted invoice must match the accepted quotation and contact'; end if;
    end if;
    if tg_op='INSERT' then
      perform pg_advisory_xact_lock(21021,1);
      select coalesce(max(substring(quotation_number from '^QUO-([0-9]+)$')::bigint),0)+1 into seq from public.quotations;
      new.quotation_number='QUO-' || lpad(seq::text,greatest(4,length(seq::text)), '0');
    elsif new.quotation_number<>old.quotation_number then raise exception 'Document number cannot be changed'; end if;
  else
    if jsonb_array_length(new.line_items)>0 then
      new.amount=public.billing_total(new.line_items,new.discount_amount,new.tax_rate,new.deposit_amount);
    elsif tg_op='INSERT' or jsonb_array_length(old.line_items)>0 then
      raise exception 'Add at least one line item';
    end if;
    if tg_op='INSERT' then
      perform pg_advisory_xact_lock(21021,2);
      select coalesce(max(substring(invoice_number from '^INV-([0-9]+)$')::bigint),0)+1 into seq from public.invoices;
      new.invoice_number='INV-' || lpad(seq::text,greatest(4,length(seq::text)), '0');
      select c.full_name,c.email into contact from public.projects p join public.clients c on c.id=p.client_id where p.id=new.project_id;
      if contact.full_name is null then raise exception 'Project contact not found'; end if;
      new.recipient_name=contact.full_name; new.recipient_email=contact.email;
    else
      if new.project_id<>old.project_id or new.invoice_number<>old.invoice_number then raise exception 'Invoice identity cannot be changed'; end if;
      if new.recipient_name is distinct from old.recipient_name or new.recipient_email is distinct from old.recipient_email then raise exception 'Invoice recipient cannot be changed'; end if;
      select coalesce(sum(amount),0) into total_paid from public.payments where invoice_id=new.id;
      if new.amount<total_paid then raise exception 'Invoice total cannot be less than recorded payments'; end if;
    end if;
  end if;
  return new;
end; $$;
create trigger prepare_invoice before insert or update on public.invoices for each row execute function public.prepare_billing_document();
create trigger prepare_quotation before insert or update on public.quotations for each row execute function public.prepare_billing_document();

create function public.convert_quotation_to_invoice(p_quotation_id uuid,p_project_id uuid,p_due_date date default null)
returns public.invoices language plpgsql security invoker set search_path=public,pg_temp as $$
declare q public.quotations; result public.invoices; client public.clients;
begin
  select * into q from public.quotations where id=p_quotation_id for update;
  if not found then raise exception 'Quotation not found'; end if;
  if q.invoice_id is not null then select * into result from public.invoices where id=q.invoice_id; return result; end if;
  if q.status<>'accepted' then raise exception 'Accept the quotation before conversion'; end if;
  select c.* into client from public.projects p join public.clients c on c.id=p.client_id where p.id=p_project_id;
  if client.id is null or (q.client_id is not null and q.client_id<>client.id) or (q.lead_id is not null and q.lead_id is distinct from client.lead_id) then
    raise exception 'Choose a project belonging to this quotation contact'; end if;
  insert into public.invoices(project_id,invoice_number,amount,line_items,discount_amount,tax_rate,deposit_amount,notes,payment_terms,due_date)
    values(p_project_id,'AUTO',q.amount,q.line_items,q.discount_amount,q.tax_rate,q.deposit_amount,q.notes,q.payment_terms,p_due_date)
    returning * into result;
  update public.quotations set invoice_id=result.id where id=q.id;
  return result;
end; $$;
revoke all on function public.convert_quotation_to_invoice(uuid,uuid,date) from public,anon;
grant execute on function public.convert_quotation_to_invoice(uuid,uuid,date) to authenticated;
notify pgrst,'reload schema';
commit;
