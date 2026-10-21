export interface Followup {
  id: string;
  lead_id: string;
  user_id: string;
  action: string;
  due_at: string;
  status: "pending" | "done" | "cancelled";
  completed_at: string | null;
  created_at: string;
  leads?: {
    full_name: string;
    email: string;
    last_contacted_at?: string | null;
  } | null;
}
