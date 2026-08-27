export interface ProjectFile {
  id: string;
  project_id: string;
  file_name: string;
  storage_path: string;
  mime_type: string;
  file_size: number;
  uploaded_by: string | null;
  created_at: string;
}

export interface NewProjectFileInput {
  project_id: string;
  file_name: string;
  storage_path: string;
  mime_type: string;
  file_size: number;
}