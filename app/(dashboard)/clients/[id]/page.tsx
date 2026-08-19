import { DashboardShell } from "@/components/layout/DashboardShell";
import { ClientDetailView } from "@/features/clients/components/ClientDetailView";
import { getClientById } from "@/features/clients/api";
import { getLeadById } from "@/features/leads/api";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

/**
 * /clients/[id] — protected by proxy.ts (the "/clients" prefix check in
 * proxy.ts already covers nested paths like this one). Fetches the
 * client and, if it came from a lead, that lead's details too.
 */
export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const client = await getClientById(supabase, id);
  if (!client) notFound();

  const relatedLead = client.lead_id ? await getLeadById(supabase, client.lead_id) : null;

  return (
    <DashboardShell pageTitle={client.full_name}>
      <ClientDetailView client={client} relatedLead={relatedLead} />
    </DashboardShell>
  );
}