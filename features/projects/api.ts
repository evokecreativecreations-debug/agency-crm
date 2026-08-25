import type { SupabaseClient } from "@supabase/supabase-js";
import type { NewProjectInput, Project, ProjectStatus, ProjectUpdateInput } from "@/types/project";

/**
 * Data-access functions for the Projects module. Same pattern as
 * features/inquiries/api.ts, features/leads/api.ts, and
 * features/clients/api.ts — accept a SupabaseClient so these work with
 * either the server client (page load) or the browser client
 * (interactive updates from a "use client" component).
 */

export async function getProjects(supabase: SupabaseClient): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Project[];
}

export async function getProjectsByClientId(
  supabase: SupabaseClient,
  clientId: string
): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Project[];
}

export async function getProjectById(
  supabase: SupabaseClient,
  id: string
): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as Project | null;
}

export async function createProject(
  supabase: SupabaseClient,
  input: NewProjectInput
): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .insert({
      client_id: input.client_id,
      service_id: input.service_id || null,
      title: input.title,
      description: input.description || null,
      start_date: input.start_date || null,
      due_date: input.due_date || null,
      status: "planning",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Project;
}

export async function updateProject(
  supabase: SupabaseClient,
  id: string,
  updates: ProjectUpdateInput
): Promise<void> {
  const { error } = await supabase.from("projects").update(updates).eq("id", id);
  if (error) throw new Error(error.message);
}

/** Convenience wrapper around updateProject for the common case of just
 * changing status — avoids duplicating the update call at every call site. */
export async function updateProjectStatus(
  supabase: SupabaseClient,
  id: string,
  status: ProjectStatus
): Promise<void> {
  await updateProject(supabase, id, { status });
}
