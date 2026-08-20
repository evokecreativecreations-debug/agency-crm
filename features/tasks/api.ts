import type { SupabaseClient } from "@supabase/supabase-js";
import type { NewTaskInput, Task, TaskStatus, UpdateTaskInput } from "@/types/task";

/**
 * Data-access functions for the Tasks module. Same pattern as every
 * prior module's api.ts — accept a SupabaseClient so these work with
 * either the server client (page load) or the browser client
 * (interactive updates from a "use client" component).
 *
 * Naming follows the established getXById convention (getProjectById,
 * getClientById, getLeadById) rather than a bare getTask(id), to stay
 * consistent with the rest of the codebase.
 */

export async function getTasks(supabase: SupabaseClient, projectId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Task[];
}

export async function getTaskById(supabase: SupabaseClient, id: string): Promise<Task | null> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as Task | null;
}

export async function createTask(supabase: SupabaseClient, input: NewTaskInput): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      project_id: input.project_id,
      title: input.title,
      description: input.description || null,
      due_date: input.due_date || null,
      status: "todo",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Task;
}

export async function updateTask(
  supabase: SupabaseClient,
  id: string,
  updates: UpdateTaskInput
): Promise<void> {
  const { error } = await supabase.from("tasks").update(updates).eq("id", id);
  if (error) throw new Error(error.message);
}

/** Convenience wrapper around updateTask for the common case of just
 * changing status — avoids duplicating the update call at every call site. */
export async function updateTaskStatus(
  supabase: SupabaseClient,
  id: string,
  status: TaskStatus
): Promise<void> {
  await updateTask(supabase, id, { status });
}