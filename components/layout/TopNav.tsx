"use client";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SearchBar } from "@/components/ui/SearchBar";
import { NotificationButton } from "@/components/layout/NotificationButton";
import { UserMenu } from "@/components/layout/UserMenu";
import { Menu } from "lucide-react";

interface TopNavProps {
  onMenuClick?: () => void;
  pageTitle?: string;
  /** Unread notification count. 0 or undefined = no badge dot shown. */
  unreadCount?: number;
}

/**
 * TopNav — the header bar above every dashboard page.
 * Row 1: hamburger (mobile) + breadcrumbs, search, notifications, account.
 * Row 2: page title (only rendered when pageTitle is provided).
 */
export function TopNav({ onMenuClick, pageTitle, unreadCount = 0 }: TopNavProps) {
  return (
    <header className="flex shrink-0 flex-col border-b border-line bg-surface">
      <div className="flex h-14 items-center justify-between gap-3 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onMenuClick}
            className="rounded-[var(--radius-sm)] p-1.5 text-slate hover:bg-paper hover:text-ink md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Breadcrumbs />
        </div>

        <div className="hidden flex-1 justify-center px-4 sm:flex">
          <SearchBar />
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <NotificationButton unreadCount={unreadCount} />
          <UserMenu />
        </div>
      </div>

      {pageTitle && (
        <div className="px-4 pb-3 md:px-6">
          <h1 className="text-sm font-semibold text-ink">{pageTitle}</h1>
        </div>
      )}
    </header>
  );
}
