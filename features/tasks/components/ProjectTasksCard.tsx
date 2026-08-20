"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Caption } from "@/components/ui/Typography";
import { TaskFormDialog } from "@/features/tasks/components/TaskFormDialog";
import { updateTaskStatus } from "@/features/tasks/api";
import { createClient } from "@/lib/supabase/client";
import type { Task, TaskStatus } from "@/types/task";
import { Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProjectTasksCardProps {
  projectId: string;
  initialTasks: Task[];
}

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

const ALL_STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * ProjectTasksCard — the "Tasks" section on a Project's detail page
 * (Phase 7 requirement 5: view/create/edit tasks for a project, each
 * task automatically linked via projectId). Same isolated-interactivity
 * approach as ClientProjectsCard in Phase 6 — the one client component
 * embedded into the otherwise server-rendered ProjectDetailView.
 */
export function ProjectTasksCard({ projectId, initialTasks }: ProjectTasksCardProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  function handleCreated(task: Task) {
    setTasks((prev) => [task, ...prev]);
    router.refresh();
  }

  function handleEdited(task: Task) {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    router.refresh();
  }

  async function handleStatusChange(id: string, status: TaskStatus) {
    setUpdatingId(id);
    // Optimistic update so the dropdown feels instant.
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    try {
      const supabase = createClient();
      await updateTaskStatus(supabase, id, status);
    } finally {
      setUpdatingId(null);
      router.refresh();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
        <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> New Task
        </Button>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-sm text-slate">No tasks for this project yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {tasks.map((task) => {
              const dueDate = formatDate(task.due_date);
              return (
                <li key={task.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <button
                      onClick={() => setEditingTask(task)}
                      className="flex items-center gap-1.5 text-left text-sm font-medium text-ink transition-colors hover:text-signal"
                    >
                      {task.title}
                      <Pencil className="h-3 w-3 shrink-0 text-muted" aria-hidden="true" />
                    </button>
                    {dueDate && <Caption>Due {dueDate}</Caption>}
                  </div>
                  <Select
                    aria-label={`Status for ${task.title}`}
                    value={task.status}
                    disabled={updatingId === task.id}
                    onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                    className="h-8 w-36 shrink-0 text-xs"
                  >
                    {ALL_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABEL[status]}
                      </option>
                    ))}
                  </Select>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>

      <TaskFormDialog
        open={dialogOpen}
        projectId={projectId}
        onClose={() => setDialogOpen(false)}
        onSaved={handleCreated}
      />

      <TaskFormDialog
        key={editingTask?.id ?? "none"}
        open={editingTask !== null}
        projectId={projectId}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSaved={handleEdited}
      />
    </Card>
  );
}