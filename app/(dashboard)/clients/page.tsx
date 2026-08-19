import { DashboardShell } from "@/components/layout/DashboardShell";
import { ClientsView } from "@/features/clients/components/ClientsView";
import { getClients } from "@/features/clients/api";
import { createClient } from "@/lib/supabase/server";

/**
 * /clients — protected by proxy.ts (see PROTECTED_PREFIXES). Fetches the
 * initial list server-side, same pattern as /inquiries and /leads.
 */
export default async function ClientsPage() {
  const supabase = await createClient();
  const clients = await getClients(supabase);

  return (
    <DashboardShell pageTitle="Clients">
      <ClientsView initialClients={clients} />
    </DashboardShell>
  );
}