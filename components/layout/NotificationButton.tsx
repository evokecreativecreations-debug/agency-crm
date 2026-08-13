"use client";

import { Bell } from "lucide-react";

interface NotificationButtonProps {
  unreadCount?: number;
  onClick?: () => void;
}

/**
 * NotificationButton — the bell icon in TopNav with an unread-count dot.
 * UI only — the real Notification Center (dropdown list, mark-as-read,
 * live unread count from the `notifications` table) is Phase 12. This
 * component just needs to be wired to open that panel once it exists.
 */
export function NotificationButton({ unreadCount = 0, onClick }: NotificationButtonProps) {
  return (
    <button
      onClick={onClick}
      className="relative rounded-[var(--radius-sm)] p-2 text-slate transition-colors hover:bg-paper hover:text-ink"
      aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
    >
      <Bell className="h-[18px] w-[18px]" />
      {unreadCount > 0 && (
        <span
          className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger ring-2 ring-surface"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
