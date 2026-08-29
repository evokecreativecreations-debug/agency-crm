-- Allow authenticated agency users to delete inquiries.
-- Leads linked through leads.inquiry_id are preserved because that
-- foreign key uses ON DELETE SET NULL.

create policy "Authenticated users can delete inquiries"
  on public.inquiries for delete
  using (auth.role() = 'authenticated');
