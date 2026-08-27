import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Body, Caption, Eyebrow, H1 } from "@/components/ui/Typography";
import { InvoicesCard } from "@/features/invoices/components/InvoicesCard";
import {
  PROJECT_STATUS_BADGE_VARIANT,
  PROJECT_STATUS_LABEL,
} from "@/features/projects/components/ProjectsView";
import { ProjectFilesCard } from "@/features/files/components/ProjectFilesCard";
import { ProjectRevisionsCard } from "@/features/revisions/components/ProjectRevisionsCard";
import { ProjectTasksCard } from "@/features/tasks/components/ProjectTasksCard";
import type { Client } from "@/types/client";
import type { Invoice } from "@/types/invoice";
import type { Project } from "@/types/project";
import type { Revision } from "@/types/revision";
import type { Task } from "@/types/task";
import { Building2, Calendar, CalendarClock, FileText } from "lucide-react";
import Link from "next/link";

interface ProjectDetailViewProps {
  project: Project;
  client: Client | null;
  tasks: Task[];
  revisions: Revision[];
  invoices: Invoice[];
}

function formatDate(iso: string | null) {
  if (!iso) return null;

  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * ProjectDetailView — read-only detail page for a single project.
 * Status is shown as a Badge here (not editable) — the interactive
 * status dropdown lives on the /projects list page, same split used
 * between ClientDetailView (read-only) and LeadsView (interactive).
 */
export function ProjectDetailView({
  project,
  client,
  tasks,
  revisions,
  invoices,
}: ProjectDetailViewProps) {
  const startDate = formatDate(project.start_date);
  const dueDate = formatDate(project.due_date);

  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Project</Eyebrow>

        <div className="mt-1 flex flex-wrap items-center gap-3">
          <H1>{project.title}</H1>

          <Badge variant={PROJECT_STATUS_BADGE_VARIANT[project.status]}>
            {PROJECT_STATUS_LABEL[project.status]}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>

          <CardContent>
            {client ? (
              <div className="flex items-center gap-2.5">
                <Building2
                  className="h-4 w-4 text-slate"
                  aria-hidden="true"
                />

                <Link
                  href={`/clients/${client.id}`}
                  className="text-ink transition-colors hover:text-signal hover:underline"
                >
                  {client.full_name}
                  {client.company_name
                    ? ` — ${client.company_name}`
                    : ""}
                </Link>
              </div>
            ) : (
              <Body className="text-slate">Client not found.</Body>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex items-center gap-2.5">
              <Calendar
                className="h-4 w-4 text-slate"
                aria-hidden="true"
              />

              <Body>
                Started {startDate ?? <Caption>Not set</Caption>}
              </Body>
            </div>

            <div className="flex items-center gap-2.5">
              <CalendarClock
                className="h-4 w-4 text-slate"
                aria-hidden="true"
              />

              <Body>
                Due {dueDate ?? <Caption>Not set</Caption>}
              </Body>
            </div>
          </CardContent>
        </Card>
      </div>

      <ProjectTasksCard
        projectId={project.id}
        initialTasks={tasks}
      />

      <ProjectRevisionsCard
        projectId={project.id}
        initialRevisions={revisions}
      />

      <InvoicesCard
        projectId={project.id}
        initialInvoices={invoices}
      />

      <ProjectFilesCard projectId={project.id} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText
              className="h-4 w-4"
              aria-hidden="true"
            />
            Description
          </CardTitle>
        </CardHeader>

        <CardContent>
          {project.description ? (
            <Body className="whitespace-pre-wrap">
              {project.description}
            </Body>
          ) : (
            <Body className="text-slate">
              No description yet.
            </Body>
          )}
        </CardContent>
      </Card>
    </div>
  );
}