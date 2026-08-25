import { DashboardShell } from "@/components/layout/DashboardShell";
import { ProjectsView } from "@/features/projects/components/ProjectsView";
import { getClients } from "@/features/clients/api";
import { getProjects } from "@/features/projects/api";
import { getServices } from "@/features/services/api";
import { createClient } from "@/lib/supabase/server";

/**
 * /projects — protected by proxy.ts (see PROTECTED_PREFIXES). Fetches
 * projects and clients (needed for the New Project client picker)
 * server-side, same pattern as the other list pages.
 */
export default async function ProjectsPage() {
  const supabase = await createClient();
  const [projects, clients, services] = await Promise.all([
    getProjects(supabase),
    getClients(supabase),
    getServices(supabase, false),
  ]);

  return (
    <DashboardShell pageTitle="Projects">
      <ProjectsView initialProjects={projects} clients={clients} services={services} />
    </DashboardShell>
  );
}
