"use client";

import type { BadgeProps } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/Table";
import { Caption } from "@/components/ui/Typography";
import { NewProjectDialog } from "@/features/projects/components/NewProjectDialog";
import { updateProjectStatus } from "@/features/projects/api";
import { createClient } from "@/lib/supabase/client";
import type { Client } from "@/types/client";
import type { Project, ProjectStatus } from "@/types/project";
import type { Service } from "@/types/service";
import { FolderKanban, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

interface ProjectsViewProps {
  initialProjects: Project[];
  clients: Client[];
  services: Service[];
}

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  planning: "Planning",
  in_progress: "In Progress",
  in_revision: "In Revision",
  completed: "Completed",
  on_hold: "On Hold",
};

export const PROJECT_STATUS_BADGE_VARIANT: Record<ProjectStatus, BadgeProps["variant"]> = {
  planning: "neutral",
  in_progress: "info",
  in_revision: "warning",
  completed: "success",
  on_hold: "project",
};

const ALL_STATUSES: ProjectStatus[] = [
  "planning",
  "in_progress",
  "in_revision",
  "completed",
  "on_hold",
];

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * ProjectsView — list + inline status management for Projects (same
 * pattern as LeadsView), plus the "New Project" action wired to a client
 * picker (NewProjectDialog).
 */
export function ProjectsView({ initialProjects, clients, services }: ProjectsViewProps) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const clientNameById = useMemo(() => {
    const map = new Map<string, string>();
    clients.forEach((c) => map.set(c.id, c.full_name));
    return map;
  }, [clients]);

  function handleCreated(project: Project) {
    setProjects((prev) => [project, ...prev]);
    router.refresh();
  }

  async function handleStatusChange(id: string, status: ProjectStatus) {
    setUpdatingId(id);
    // Optimistic update so the dropdown feels instant.
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    try {
      const supabase = createClient();
      await updateProjectStatus(supabase, id, status);
    } finally {
      setUpdatingId(null);
      router.refresh();
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Projects"
        description="Active and past work across all your clients."
        actions={
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> New Project
          </Button>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create a project for a client to start tracking work here."
          action={{ label: "New Project", onClick: () => setDialogOpen(true) }}
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Title</TableHeaderCell>
              <TableHeaderCell>Client</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Due</TableHeaderCell>
              <TableHeaderCell>Created</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => {
              const dueDate = formatDate(project.due_date);
              return (
                <TableRow key={project.id}>
                  <TableCell>
                    <Link
                      href={`/projects/${project.id}`}
                      className="font-medium text-ink transition-colors hover:text-signal hover:underline"
                    >
                      {project.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {clientNameById.get(project.client_id) ?? <Caption>—</Caption>}
                  </TableCell>
                  <TableCell>
                    <Select
                      aria-label={`Status for ${project.title}`}
                      value={project.status}
                      disabled={updatingId === project.id}
                      onChange={(e) =>
                        handleStatusChange(project.id, e.target.value as ProjectStatus)
                      }
                      className="h-8 min-w-[9.5rem] text-xs"
                    >
                      {ALL_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {PROJECT_STATUS_LABEL[status]}
                        </option>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>{dueDate ? <Caption>{dueDate}</Caption> : <Caption>—</Caption>}</TableCell>
                  <TableCell>
                    <Caption>{formatDate(project.created_at)}</Caption>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <NewProjectDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={handleCreated}
        clients={clients}
        services={services}
      />
    </>
  );
}
