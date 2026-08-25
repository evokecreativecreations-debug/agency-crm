"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell } from "lucide-react";

import type { Notification } from "@/types/notification";
import {
  getUnreadNotificationCount,
  getUnreadNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/features/notifications/api";

import { createClient } from "@/lib/supabase/client";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const loadNotifications = useCallback(async () => {
    try {
      const [items, unreadCount] = await Promise.all([
        getUnreadNotifications(supabase),
        getUnreadNotificationCount(supabase),
      ]);

      setNotifications(items);
      setCount(unreadCount);
    } catch (error) {
      console.error("Failed to load notifications:", error);
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

  async function handleNotificationClick(notification: Notification) {
    try {
      await markNotificationAsRead(supabase, notification.id);

      setNotifications((current) =>
        current.filter((item) => item.id !== notification.id)
      );

      setCount((current) => Math.max(0, current - 1));

      if (notification.link) {
        window.location.assign(notification.link);
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }

  async function handleMarkAllRead() {
    if (count === 0) return;

    setLoading(true);

    try {
      await markAllNotificationsAsRead(supabase);

      setNotifications([]);
      setCount(0);
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />

        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-lg border bg-background shadow-lg">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold">Notifications</h2>

                <p className="text-xs text-muted-foreground">
                  {count === 0
                    ? "You're all caught up"
                    : `${count} unread notification${
                        count === 1 ? "" : "s"
                      }`}
                </p>
              </div>

              {count > 0 && (
                <button
                  type="button"
                  onClick={() => void handleMarkAllRead()}
                  disabled={loading}
                  className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Mark all read"}
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <Bell className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

                  <p className="text-sm font-medium">
                    No new notifications
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    New notifications will appear here.
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() =>
                      void handleNotificationClick(notification)
                    }
                    className="flex w-full gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/50"
                  >
                    <div
                      className={[
                        "mt-1 h-2 w-2 shrink-0 rounded-full",
                        notification.type === "success"
                          ? "bg-green-500"
                          : notification.type === "warning"
                            ? "bg-yellow-500"
                            : notification.type === "error"
                              ? "bg-red-500"
                              : "bg-blue-500",
                      ].join(" ")}
                    />

                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {notification.title}
                      </p>

                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {notification.message}
                      </p>

                      <p className="mt-2 text-[11px] text-muted-foreground">
                        {formatNotificationDate(notification.created_at)}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="border-t px-4 py-2">
              <a
                href="/notifications"
                onClick={() => setOpen(false)}
                className="block text-center text-xs font-medium text-primary hover:underline"
              >
                View all notifications
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
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