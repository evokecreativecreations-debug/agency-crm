/**
 * Mirrors the "tasks" table — see CRM_Blueprint_v2.md, Section 3.
 * Note: the frozen schema has no "priority" or "updated_at" column.
 */

export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assigned_to: string | null;
  due_date: string | null;
  created_at: string;
}

/** Fields required to create a task. project_id is always required —
 * every task must belong to exactly one project. */
export interface NewTaskInput {
  project_id: string;
  title: string;
  description?: string;
  due_date?: string;
}

/** Fields that can be changed after a task is created. */
export type UpdateTaskInput = Partial<
  Pick<Task, "title" | "description" | "status" | "due_date">
>;