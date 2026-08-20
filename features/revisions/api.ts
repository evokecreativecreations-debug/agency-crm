import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  NewRevisionInput,
  Revision,
  RevisionStatus,
  UpdateRevisionInput,
} from "@/types/revision";

/**
 * Data-access functions for the Revisions module. Same pattern as every
 * prior module's api.ts (features/tasks/api.ts, features/projects/api.ts,
 * features/clients/api.ts) — accept a SupabaseClient so these work with
 * either the server client (page load) or the browser client
 * (interactive updates from a "use client" component).
 *
 * Naming follows the established getXById convention (getProjectById,
 * getTaskById, getClientById, etc.) rather than a bare getRevision(id),
 * to stay consistent with the rest of the codebase.
 */

/**
 * Returns every revision round for a project, ordered oldest-first
 * (Revision 1, 2, 3...) so the history reads top-to-bottom in order.
 */
export async function getRevisions(
  supabase: SupabaseClient,
  projectId: string
): Promise<Revision[]> {
  const { data, error } = await supabase
    .from("revisions")
    .select("*")
    .eq("project_id", projectId)
    .order("round_number", { ascending: true });

  if (error) throw new Error(error.message);
  return data as Revision[];
}

/**
 * Returns a single revision by id, or null if no revision with that id
 * exists (e.g. a stale/invalid link) — callers decide how to handle
 * "not found" rather than this function throwing for a missing row.
 */
export async function getRevisionById(
  supabase: SupabaseClient,
  id: string
): Promise<Revision | null> {
  const { data, error } = await supabase
    .from("revisions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as Revision | null;
}

/**
 * Creates a revision with an automatically-assigned round_number — the
 * next sequential number for that project (Revision 1, 2, 3...), not
 * something the caller supplies. Looks up the current highest
 * round_number for the project and adds 1 (starts at 1 if there are none
 * yet). The database's unique(project_id, round_number) constraint
 * (see the Phase 8 migration) is a second line of defense against a
 * collision, e.g. from a race condition between two simultaneous creates.
 */
export async function createRevision(
  supabase: SupabaseClient,
  input: NewRevisionInput
): Promise<Revision> {
  const { data: latest, error: latestError } = await supabase
    .from("revisions")
    .select("round_number")
    .eq("project_id", input.project_id)
    .order("round_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestError) throw new Error(latestError.message);
  const nextRoundNumber = (latest?.round_number ?? 0) + 1;

  const { data, error } = await supabase
    .from("revisions")
    .insert({
      project_id: input.project_id,
      round_number: nextRoundNumber,
      feedback: input.feedback,
      status: "requested",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Revision;
}

/**
 * Updates one or more fields on an existing revision (feedback and/or
 * status). Used directly for editing feedback, and internally by
 * updateRevisionStatus below for the common "just change the status" case.
 */
export async function updateRevision(
  supabase: SupabaseClient,
  id: string,
  updates: UpdateRevisionInput
): Promise<void> {
  const { error } = await supabase.from("revisions").update(updates).eq("id", id);
  if (error) throw new Error(error.message);
}

/**
 * Convenience wrapper around updateRevision for the common case of just
 * changing status — avoids duplicating the update call at every call
 * site (same approach as updateTaskStatus/updateProjectStatus).
 */
export async function updateRevisionStatus(
  supabase: SupabaseClient,
  id: string,
  status: RevisionStatus
): Promise<void> {
  await updateRevision(supabase, id, { status });
}