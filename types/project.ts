/** Mirrors the "projects" table — see CRM_Blueprint_v2.md, Section 3. */

export type ProjectStatus =
  | "planning"
  | "in_progress"
  | "in_revision"
  | "completed"
  | "on_hold";

export interface Project {
  id: string;
  client_id: string;
  service_id: string | null;
  title: string;
  description: string | null;
  status: ProjectStatus;
  start_date: string | null;
  due_date: string | null;
  created_at: string;
}

/**
 * Fields required to create a project.
 * A project must always belong to a client.
 */
export interface NewProjectInput {
  client_id: string;
  service_id?: string;
  title: string;
  description?: string;
  start_date?: string;
  due_date?: string;
}

/**
 * Fields that can be updated after the project has been created.
 */
export type ProjectUpdateInput = Partial<
  Pick<
    Project,
    "service_id" | "title" | "description" | "status" | "start_date" | "due_date"
  >
>;
