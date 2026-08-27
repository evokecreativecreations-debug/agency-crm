import { DashboardShell } from "@/components/layout/DashboardShell";
import { ClientDetailView } from "@/features/clients/components/ClientDetailView";
import { getActivityLogsForEntity } from "@/features/activity-log/api";
import { getClientById } from "@/features/clients/api";
import { getLeadById } from "@/features/leads/api";
import { getProjectsByClientId } from "@/features/projects/api";
import { getServices } from "@/features/services/api";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const client = await getClientById(supabase, id);

  if (!client) {
    notFound();
  }

  const [relatedLead, projects, services, activities] = await Promise.all([
    client.lead_id
      ? getLeadById(supabase, client.lead_id)
      : Promise.resolve(null),
    getProjectsByClientId(supabase, client.id),
    getServices(supabase, false),
    getActivityLogsForEntity(supabase, "client", client.id),
  ]);

  return (
    <DashboardShell pageTitle={client.full_name}>
      <ClientDetailView
        client={client}
        relatedLead={relatedLead}
        projects={projects}
        services={services}
        activities={activities}
      />
    </DashboardShell>
  );
}