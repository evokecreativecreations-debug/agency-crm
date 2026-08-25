import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActivityEntityType, ActivityLog } from "@/types/activity-log";

/**
 * Read-only access for the append-only activity log. Mutations happen
 * in PostgreSQL triggers so every module records activity consistently.
 */
export async function getActivityLogs(
  supabase: SupabaseClient,
  limit = 20
): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data as ActivityLog[];
}

export async function getActivityLogsForEntity(
  supabase: SupabaseClient,
  entityType: ActivityEntityType,
  entityId: string,
  limit = 50
): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data as ActivityLog[];
}
