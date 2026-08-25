/**
 * Mirrors the "notifications" table.
 */

export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link: string | null;
  created_at: string;
}

/**
 * Fields required to create a notification.
 */
export interface NewNotificationInput {
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
}

/**
 * Fields that can be changed after a notification is created.
 */
export type UpdateNotificationInput = Partial<
  Pick<Notification, "title" | "message" | "type" | "read" | "link">
>;