create policy "Authenticated users can delete leads"
on public.leads
for delete
using (auth.role() = 'authenticated');

create policy "Authenticated users can delete clients"
on public.clients
for delete
using (auth.role() = 'authenticated');