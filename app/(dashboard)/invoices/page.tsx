import { DashboardShell } from "@/components/layout/DashboardShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { H3 } from "@/components/ui/Typography";
import { InvoicesCard } from "@/features/invoices/components/InvoicesCard";
import { getInvoices } from "@/features/invoices/api";
import { getProjects } from "@/features/projects/api";
import { createClient } from "@/lib/supabase/server";
import { FileText } from "lucide-react";
import Link from "next/link";

/**
 * /invoices — protected by proxy.ts (see PROTECTED_PREFIXES). Unlike
 * Tasks/Revisions, Invoices has a top-level nav entry (lib/navigation.ts),
 * so it needs this page even though invoices are still scoped per
 * project (features/invoices/api.ts has no "all invoices" query).
 *
 * Fetches every project, then that project's invoices, and renders the
 * existing InvoicesCard once per project — same component used on
 * /projects/[id], reused as-is with no modifications.
 */
export default async function InvoicesPage() {
  const supabase = await createClient();
  const projects = await getProjects(supabase);

  const projectsWithInvoices = await Promise.all(
    projects.map(async (project) => ({
      project,
      invoices: await getInvoices(supabase, project.id),
    }))
  );

  return (
    <DashboardShell pageTitle="Invoices">
      <PageHeader
        eyebrow="Billing"
        title="Invoices"
        description="Every invoice across all your projects, grouped by project."
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No projects yet"
          description="Invoices are created from inside a project. Create a project first, then add invoices to it."
        />
      ) : (
        <div className="space-y-6">
          {projectsWithInvoices.map(({ project, invoices }) => (
            <div key={project.id}>
              <Link
                href={`/projects/${project.id}`}
                className="mb-2 inline-block transition-colors hover:text-signal"
              >
                <H3>{project.title}</H3>
              </Link>
              <InvoicesCard projectId={project.id} initialInvoices={invoices} />
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}