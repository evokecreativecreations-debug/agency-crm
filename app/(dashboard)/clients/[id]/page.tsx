import { DashboardShell } from "@/components/layout/DashboardShell";
import { ClientDetailView } from "@/features/clients/components/ClientDetailView";
import { getClientById } from "@/features/clients/api";
import { getLeadById } from "@/features/leads/api";
import { getProjectsByClientId } from "@/features/projects/api";
import { getServices } from "@/features/services/api";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

/**
 * /clients/[id] — protected by proxy.ts (the "/clients" prefix check in
 * proxy.ts already covers nested paths like this one). Fetches the
 * client, its related lead (if any), and its projects (Phase 6).
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

  const [relatedLead, projects, services] = await Promise.all([
    client.lead_id ? getLeadById(supabase, client.lead_id) : Promise.resolve(null),
    getProjectsByClientId(supabase, client.id),
    getServices(supabase, false),
  ]);

  return (
    <DashboardShell pageTitle={client.full_name}>
      <ClientDetailView
        client={client}
        relatedLead={relatedLead}
        projects={projects}
        services={services}
      />
    </DashboardShell>
  );
}
