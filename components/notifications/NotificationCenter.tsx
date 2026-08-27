"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";

import type { Notification } from "@/types/notification";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/features/notifications/api";

import { createClient } from "@/lib/supabase/client";

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const supabase = createClient();

  const loadNotifications = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getNotifications(supabase);
      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadNotifications();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadNotifications]);

  async function handleMarkRead(id: string) {
    try {
      await markNotificationAsRead(supabase, id);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }

  async function handleMarkAllRead() {
    setMarkingAll(true);

    try {
      await markAllNotificationsAsRead(supabase);

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    } finally {
      setMarkingAll(false);
    }
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  if (loading) {
    return (
      <div className="rounded-lg border bg-background">
        <div className="border-b px-6 py-4">
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        </div>

        <div className="space-y-4 p-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex gap-3">
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />

              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-background">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">Notifications</h1>

          <p className="text-sm text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} unread notification${
                  unreadCount === 1 ? "" : "s"
                }`
              : "You're all caught up"}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => void handleMarkAllRead()}
            disabled={markingAll}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />

            {markingAll ? "Marking..." : "Mark all as read"}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <Bell className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />

          <h2 className="text-sm font-semibold">No notifications yet</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Notifications from your CRM will appear here.
          </p>
        </div>
      ) : (
        <div>
          {notifications.map((notification) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
              onMarkRead={handleMarkRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationRow({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: (id: string) => Promise<void>;
}) {
  const content = (
    <>
      <div
        className={[
          "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
          notification.read ? "bg-muted" : getTypeDot(notification.type),
        ].join(" ")}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <h2
            className={[
              "text-sm",
              notification.read ? "font-medium" : "font-semibold",
            ].join(" ")}
          >
            {notification.title}
          </h2>

          {!notification.read && (
            <span className="shrink-0 text-xs font-medium text-primary">
              New
            </span>
          )}
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          {notification.message}
        </p>

        <p className="mt-2 text-xs text-muted-foreground">
          {formatNotificationDate(notification.created_at)}
        </p>
      </div>
    </>
  );

  return (
    <div
      className={[
        "flex gap-3 border-b px-6 py-4 last:border-b-0",
        notification.read ? "" : "bg-muted/20",
      ].join(" ")}
    >
      {notification.link ? (
        <a
          href={notification.link}
          className="flex min-w-0 flex-1 gap-3 hover:opacity-80"
          onClick={() => {
            if (!notification.read) {
              void onMarkRead(notification.id);
            }
          }}
        >
          {content}
        </a>
      ) : (
        <button
          type="button"
          className="flex min-w-0 flex-1 gap-3 text-left hover:opacity-80"
          onClick={() => {
            if (!notification.read) {
              void onMarkRead(notification.id);
            }
          }}
        >
          {content}
        </button>
      )}

      {!notification.read && (
        <button
          type="button"
          onClick={() => void onMarkRead(notification.id)}
          className="shrink-0 self-center text-xs font-medium text-primary hover:underline"
        >
          Mark read
        </button>
      )}
    </div>
  );
}

function getTypeDot(type: Notification["type"]): string {
  switch (type) {
    case "success":
      return "bg-green-500";
    case "warning":
      return "bg-yellow-500";
    case "error":
      return "bg-red-500";
    default:
      return "bg-blue-500";
  }
}

function formatNotificationDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}