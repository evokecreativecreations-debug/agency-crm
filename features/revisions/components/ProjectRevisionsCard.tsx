"use client";

import { type BadgeProps } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { RevisionFormDialog } from "@/features/revisions/components/RevisionFormDialog";
import { updateRevisionStatus } from "@/features/revisions/api";
import { createClient } from "@/lib/supabase/client";
import type { Revision, RevisionStatus } from "@/types/revision";
import { Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProjectRevisionsCardProps {
  projectId: string;
  initialRevisions: Revision[];
}

export const REVISION_STATUS_LABEL: Record<RevisionStatus, string> = {
  requested: "Requested",
  in_progress: "In Progress",
  resolved: "Resolved",
};

export const REVISION_STATUS_BADGE_VARIANT: Record<RevisionStatus, BadgeProps["variant"]> = {
  requested: "neutral",
  in_progress: "info",
  resolved: "success",
};

const ALL_STATUSES: RevisionStatus[] = ["requested", "in_progress", "resolved"];

/**
 * ProjectRevisionsCard — the "Revisions" section on a Project's detail
 * page (Phase 8 requirement 5: view history, create rounds, edit
 * details, change status — all scoped to this project). Same isolated-
 * interactivity approach as ClientProjectsCard/ProjectTasksCard — the
 * one client component embedded into the otherwise server-rendered
 * ProjectDetailView. Revisions are listed oldest-first (Revision 1, 2,
 * 3...) so the history reads top-to-bottom in order.
 */
export function ProjectRevisionsCard({ projectId, initialRevisions }: ProjectRevisionsCardProps) {
  const router = useRouter();
  const [revisions, setRevisions] = useState(initialRevisions);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRevision, setEditingRevision] = useState<Revision | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  function handleCreated(revision: Revision) {
    setRevisions((prev) => [...prev, revision]);
    router.refresh();
  }

  function handleEdited(revision: Revision) {
    setRevisions((prev) => prev.map((r) => (r.id === revision.id ? revision : r)));
    router.refresh();
  }

  async function handleStatusChange(id: string, status: RevisionStatus) {
    setUpdatingId(id);
    // Optimistic update so the dropdown feels instant.
    setRevisions((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    try {
      const supabase = createClient();
      await updateRevisionStatus(supabase, id, status);
    } finally {
      setUpdatingId(null);
      router.refresh();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revisions</CardTitle>
        <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> New Revision Round
        </Button>
      </CardHeader>
      <CardContent>
        {revisions.length === 0 ? (
          <p className="text-sm text-slate">No revision rounds for this project yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {revisions.map((revision) => (
              <li key={revision.id} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <button
                    onClick={() => setEditingRevision(revision)}
                    className="flex items-center gap-1.5 text-left text-sm font-medium text-ink transition-colors hover:text-signal"
                  >
                    Revision {revision.round_number}
                    <Pencil className="h-3 w-3 shrink-0 text-muted" aria-hidden="true" />
                  </button>
                  <p className="line-clamp-2 text-sm text-slate">{revision.feedback}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Select
                    aria-label={`Status for Revision ${revision.round_number}`}
                    value={revision.status}
                    disabled={updatingId === revision.id}
                    onChange={(e) =>
                      handleStatusChange(revision.id, e.target.value as RevisionStatus)
                    }
                    className="h-8 w-36 text-xs"
                  >
                    {ALL_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {REVISION_STATUS_LABEL[status]}
                      </option>
                    ))}
                  </Select>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <RevisionFormDialog
        open={dialogOpen}
        projectId={projectId}
        onClose={() => setDialogOpen(false)}
        onSaved={handleCreated}
      />

      <RevisionFormDialog
        key={editingRevision?.id ?? "none"}
        open={editingRevision !== null}
        projectId={projectId}
        revision={editingRevision}
        onClose={() => setEditingRevision(null)}
        onSaved={handleEdited}
      />
    </Card>
  );
}