import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  NewNotificationInput,
  Notification,
  NotificationType,
  UpdateNotificationInput,
} from "@/types/notification";

/**
 * Data-access functions for the Notifications module.
 *
 * Accepts a SupabaseClient so the same functions can be used with
 * either the server client or browser client.
 */

export async function getNotifications(
  supabase: SupabaseClient
): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Notification[];
}

export async function getUnreadNotifications(
  supabase: SupabaseClient
): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("read", false)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Notification[];
}

export async function getUnreadNotificationCount(
  supabase: SupabaseClient
): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("read", false);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function getNotificationById(
  supabase: SupabaseClient,
  id: string
): Promise<Notification | null> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as Notification | null;
}

export async function createNotification(
  supabase: SupabaseClient,
  input: NewNotificationInput
): Promise<Notification> {
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      title: input.title.trim(),
      message: input.message.trim(),
      type: input.type ?? "info",
      link: input.link?.trim() || null,
      read: false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Notification;
}

export async function updateNotification(
  supabase: SupabaseClient,
  id: string,
  updates: UpdateNotificationInput
): Promise<void> {
  const payload: UpdateNotificationInput = {
    ...updates,
  };

  if (typeof payload.title === "string") {
    payload.title = payload.title.trim();
  }

  if (typeof payload.message === "string") {
    payload.message = payload.message.trim();
  }

  if (typeof payload.link === "string") {
    payload.link = payload.link.trim() || null;
  }

  const { error } = await supabase
    .from("notifications")
    .update(payload)
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function markNotificationAsRead(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function markNotificationAsUnread(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: false })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function markAllNotificationsAsRead(
  supabase: SupabaseClient
): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("read", false);

  if (error) {
    throw new Error(error.message);
  }
}

export async function createTypedNotification(
  supabase: SupabaseClient,
  title: string,
  message: string,
  type: NotificationType = "info",
  link?: string
): Promise<Notification> {
  return createNotification(supabase, {
    title,
    message,
    type,
    link,
  });
}