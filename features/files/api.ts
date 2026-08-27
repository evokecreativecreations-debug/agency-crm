import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  ProjectFile,
  NewProjectFileInput,
} from "@/types/file";

const BUCKET = "project-files";

export async function getProjectFiles(
  supabase: SupabaseClient,
  projectId: string
): Promise<ProjectFile[]> {
  const { data, error } = await supabase
    .from("project_files")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as ProjectFile[];
}

export async function uploadProjectFile(
  supabase: SupabaseClient,
  file: File,
  projectId: string
): Promise<ProjectFile> {
  const extension =
    file.name.split(".").pop()?.toLowerCase() ?? "";

  const filename =
    `${crypto.randomUUID()}.${extension}`;

  const storagePath =
    `${projectId}/${filename}`;

  const upload = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      upsert: false,
      contentType: file.type,
    });

  if (upload.error) {
    throw upload.error;
  }

  const payload: NewProjectFileInput = {
    project_id: projectId,
    file_name: file.name,
    storage_path: storagePath,
    mime_type: file.type,
    file_size: file.size,
  };

  const insert = await supabase
    .from("project_files")
    .insert(payload)
    .select()
    .single();

  if (insert.error) {
    await supabase.storage
      .from(BUCKET)
      .remove([storagePath]);

    throw insert.error;
  }

  return insert.data as ProjectFile;
}

export async function getSignedFileUrl(
  supabase: SupabaseClient,
  storagePath: string
): Promise<string> {
  const { data, error } =
    await supabase.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, 60 * 60);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}

export async function deleteProjectFile(
  supabase: SupabaseClient,
  file: ProjectFile
): Promise<void> {
  const storage = await supabase.storage
    .from(BUCKET)
    .remove([file.storage_path]);

  if (storage.error) {
    throw storage.error;
  }

  const database = await supabase
    .from("project_files")
    .delete()
    .eq("id", file.id);

  if (database.error) {
    throw database.error;
  }
}