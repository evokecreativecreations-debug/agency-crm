"use client";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { createTask, updateTask } from "@/features/tasks/api";
import { createClient } from "@/lib/supabase/client";
import type { Task } from "@/types/task";
import { useState, type FormEvent } from "react";

interface TaskFormDialogProps {
  open: boolean;
  projectId: string;
  /** When provided, the dialog edits this task instead of creating a new one. */
  task?: Task | null;
  onClose: () => void;
  onSaved: (task: Task) => void;
}

/**
 * TaskFormDialog — one reusable dialog for both creating and editing a
 * task, rather than two separate components (same approach as
 * NewProjectDialog in Phase 6). Status isn't edited here — that stays as
 * the inline Select per row in ProjectTasksCard, same split already used
 * for Leads/Projects (list = interactive status, dialog = details).
 */
export function TaskFormDialog({
  open,
  projectId,
  task,
  onClose,
  onSaved,
}: TaskFormDialogProps) {
  const isEditing = !!task;

  // Lazy initializers from the task prop, same pattern as
  // ConvertInquiryDialog/ConvertLeadDialog — the parent remounts this
  // with a fresh key per task, so no useEffect sync is needed.
  const [title, setTitle] = useState(() => task?.title ?? "");
  const [description, setDescription] = useState(() => task?.description ?? "");
  const [dueDate, setDueDate] = useState(() => task?.due_date ?? "");
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

      if (isEditing && task) {
        await updateTask(supabase, task.id, {
          title,
          description: description || undefined,
          due_date: dueDate || undefined,
        });
        setSaving(false);
        onSaved({ ...task, title, description: description || null, due_date: dueDate || null });
      } else {
        const created = await createTask(supabase, {
          project_id: projectId,
          title,
          description: description || undefined,
          due_date: dueDate || undefined,
        });
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
      title={isEditing ? "Edit Task" : "New Task"}
      description={isEditing ? "Update this task's details." : "Add a task to this project."}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="task-form" loading={saving}>
            {isEditing ? "Save Changes" : "Create Task"}
          </Button>
        </>
      }
    >
      <form id="task-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Task title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Design homepage mockup"
        />
        <Textarea
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Any details worth noting..."
        />
        <Input
          label="Due date (optional)"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          error={error ?? undefined}
        />
      </form>
    </Dialog>
  );
}