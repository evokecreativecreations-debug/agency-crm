"use client";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Textarea } from "@/components/ui/Textarea";
import { createRevision, updateRevision } from "@/features/revisions/api";
import { createClient } from "@/lib/supabase/client";
import type { Revision } from "@/types/revision";
import { useState, type FormEvent } from "react";

interface RevisionFormDialogProps {
  open: boolean;
  projectId: string;
  /** When provided, the dialog edits this revision instead of creating a new one. */
  revision?: Revision | null;
  onClose: () => void;
  onSaved: (revision: Revision) => void;
}

/**
 * RevisionFormDialog — one reusable dialog for both creating and editing
 * a revision round, rather than two separate components (same approach
 * as TaskFormDialog in Phase 7). The frozen schema has a single
 * "feedback" field (not separate title/notes), so that's the only field
 * here besides the auto-assigned round number. Status isn't edited here
 * — that stays as the inline Select per row, same split used throughout
 * the app (list = interactive status, dialog = details).
 */
export function RevisionFormDialog({
  open,
  projectId,
  revision,
  onClose,
  onSaved,
}: RevisionFormDialogProps) {
  const isEditing = !!revision;

  // Lazy initializer from the revision prop, same pattern used since
  // Phase 4 — the parent remounts this with a fresh key per revision, so
  // no useEffect sync is needed.
  const [feedback, setFeedback] = useState(() => revision?.feedback ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleClose() {
    setError(null);
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const supabase = createClient();

      if (isEditing && revision) {
        await updateRevision(supabase, revision.id, { feedback });
        setSaving(false);
        onSaved({ ...revision, feedback });
      } else {
        const created = await createRevision(supabase, { project_id: projectId, feedback });
        setSaving(false);
        onSaved(created);
      }
      handleClose();
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={isEditing ? `Edit Revision ${revision?.round_number}` : "New Revision Round"}
      description={
        isEditing
          ? "Update the feedback for this revision round."
          : "Log a new round of client feedback for this project."
      }
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="revision-form" loading={saving}>
            {isEditing ? "Save Changes" : "Create Revision"}
          </Button>
        </>
      }
    >
      <form id="revision-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Textarea
          label="Feedback"
          required
          rows={5}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="What did the client ask to change?"
          error={error ?? undefined}
        />
      </form>
    </Dialog>
  );
}