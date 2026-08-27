alter table public.gmail_connections enable row level security;

-- No direct SELECT/INSERT/UPDATE/DELETE policies are granted to normal clients.
-- Gmail OAuth tokens are sensitive credentials and should only be accessed
-- by trusted server-side code using the service role.

