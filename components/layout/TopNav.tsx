"use client";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { UserMenu } from "@/components/layout/UserMenu";
import { useTheme } from "@/components/layout/ThemeProvider";
import { Menu, Moon, Sun } from "lucide-react";

interface TopNavProps {
  onMenuClick?: () => void;
  pageTitle?: string;
  unreadCount?: number;
  preview?: boolean;
}

export function TopNav({ onMenuClick, pageTitle, preview = false }: TopNavProps) {
  const { setTheme } = useTheme();
  function toggleTheme() {
    setTheme(document.documentElement.classList.contains("dark") ? "light" : "dark");
  }
  return (
    <header className="flex h-20 shrink-0 items-center justify-between gap-4 border-b border-line bg-surface px-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={onMenuClick} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-slate hover:bg-paper hover:text-ink md:hidden" aria-label="Open menu"><Menu className="h-5 w-5" aria-hidden="true" /></button>
        <div className="flex min-w-0 items-center gap-3">
          <p className="truncate text-sm font-medium text-ink">{pageTitle || "Workspace"}</p>
          <div className="hidden border-l border-line pl-3 lg:block"><Breadcrumbs /></div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {preview && <span className="hidden rounded-full border border-line px-3 py-1 text-xs text-slate sm:block">Design preview</span>}
        <button type="button" onClick={toggleTheme} aria-label="Toggle light and dark theme" title="Toggle light and dark theme" className="theme-toggle flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] text-slate transition-colors hover:bg-paper hover:text-ink"><Sun className="theme-sun h-4.5 w-4.5" aria-hidden="true" /><Moon className="theme-moon h-4.5 w-4.5" aria-hidden="true" /></button>
        {!preview && <NotificationBell />}
        <span className="mx-1 h-6 w-px bg-line" aria-hidden="true" />
        {preview ? <span className="flex h-9 w-9 items-center justify-center rounded-full bg-signal-soft text-xs font-semibold text-signal" aria-label="Preview account">AG</span> : <UserMenu />}
      </div>
    </header>
  );
}
