"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  PROJECT_STATUS_BADGE_VARIANT,
  PROJECT_STATUS_LABEL,
} from "@/features/projects/components/ProjectsView";
import { NewProjectDialog } from "@/features/projects/components/NewProjectDialog";
import type { Client } from "@/types/client";
import type { Project } from "@/types/project";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ClientProjectsCardProps {
  client: Client;
  initialProjects: Project[];
}

/**
 * ClientProjectsCard — the "Projects" section on a Client's detail page
 * (Phase 6 requirement 5: creating a project from a client automatically
 * attaches it to that client). This is the one piece of interactivity on
 * an otherwise server-rendered detail page, so it's isolated into its
 * own small "use client" component rather than converting the whole
 * ClientDetailView.
 */
export function ClientProjectsCard({ client, initialProjects }: ClientProjectsCardProps) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleCreated(project: Project) {
    setProjects((prev) => [project, ...prev]);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects</CardTitle>
        <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> New Project
        </Button>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <p className="text-sm text-slate">No projects for this client yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {projects.map((project) => (
              <li key={project.id} className="flex items-center justify-between gap-3 py-2.5">
                <Link
                  href={`/projects/${project.id}`}
                  className="text-sm font-medium text-ink transition-colors hover:text-signal hover:underline"
                >
                  {project.title}
                </Link>
                <Badge variant={PROJECT_STATUS_BADGE_VARIANT[project.status]}>
                  {PROJECT_STATUS_LABEL[project.status]}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <NewProjectDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={handleCreated}
        clients={[client]}
        lockedClientId={client.id}
      />
    </Card>
  );
}