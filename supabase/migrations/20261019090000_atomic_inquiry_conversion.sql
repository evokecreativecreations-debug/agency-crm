begin;

-- One database transaction for inquiry -> lead. A row lock serializes retries
-- and simultaneous conversions of the same inquiry without changing tables or
-- deleting/merging existing records. Existing duplicate history is left intact.
create or replace function public.convert_inquiry_to_lead(
  p_inquiry_id uuid,
  p_full_name text,
  p_email text,
  p_phone text default null,
  p_notes text default null
)
returns public.leads
language plpgsql
security invoker
set search_path = ''
as $$
declare
  converted_lead public.leads;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_full_name is null or btrim(p_full_name) = '' or
     p_email is null or btrim(p_email) = '' then
    raise exception 'Name and email are required' using errcode = '22023';
  end if;

  perform 1 from public.inquiries where id = p_inquiry_id for update;
  if not found then
    raise exception 'Inquiry not found or access denied' using errcode = 'P0002';
  end if;

  select * into converted_lead from public.leads
    where inquiry_id = p_inquiry_id
    order by created_at, id limit 1;

  if not found then
    insert into public.leads (inquiry_id, full_name, email, phone, notes, status)
    values (p_inquiry_id, btrim(p_full_name), btrim(p_email),
            nullif(btrim(p_phone), ''), nullif(btrim(p_notes), ''), 'contacted')
    returning * into converted_lead;
  end if;

  update public.inquiries set status = 'converted_to_lead'
    where id = p_inquiry_id and status is distinct from 'converted_to_lead';
  return converted_lead;
end;
$$;

revoke all on function public.convert_inquiry_to_lead(uuid, text, text, text, text) from public, anon;
grant execute on function public.convert_inquiry_to_lead(uuid, text, text, text, text) to authenticated;

notify pgrst, 'reload schema';
commit;
