/** Mirrors the shared, append-only activity_logs table. */
export type ActivityEntityType =
  | "inquiry"
  | "lead"
  | "client"
  | "project"
  | "task"
  | "revision"
  | "invoice"
  | "service";

export type ActivityAction =
  | "created"
  | "updated"
  | "deleted"
  | "status_changed"
  | "payment_recorded";

export interface ActivityLog {
  id: string;
  entity_type: ActivityEntityType;
  entity_id: string;
  action: ActivityAction;
  description: string;
  performed_by: string | null;
  created_at: string;
}
