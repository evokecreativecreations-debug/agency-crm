import { DashboardShell } from "@/components/layout/DashboardShell";
import { ProjectDetailView } from "@/features/projects/components/ProjectDetailView";
import { getClientById } from "@/features/clients/api";
import { getProjectById } from "@/features/projects/api";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

/**
 * /projects/[id] — protected by proxy.ts (the "/projects" prefix check
 * in proxy.ts already covers nested paths like this one). Fetches the
 * project and its client for display.
 */
export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const project = await getProjectById(supabase, id);
  if (!project) notFound();

  const client = await getClientById(supabase, project.client_id);

  return (
    <DashboardShell pageTitle={project.title}>
      <ProjectDetailView project={project} client={client} />
    </DashboardShell>
  );
}