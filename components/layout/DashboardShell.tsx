"use client";

import { ReminderRunner } from "@/features/notifications/components/ReminderRunner";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { useCallback, useState, type ReactNode } from "react";

interface DashboardShellProps {
  children: ReactNode;
  pageTitle?: string;
  unreadCount?: number;
  /** Public design reference only: sample data and no account/notification fetches. */
  preview?: boolean;
  previewActiveHref?: string;
}

export function DashboardShell({ children, pageTitle, unreadCount, preview = false, previewActiveHref = "/dashboard" }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobileMenu = useCallback(() => setMobileOpen(false), []);
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-paper">
      <a href="#workspace-content" className="sr-only z-[60] rounded-[var(--radius-md)] bg-signal p-3 text-on-signal focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
      {!preview && <ReminderRunner />}
      <Sidebar mobileOpen={mobileOpen} onMobileClose={closeMobileMenu} activeHref={preview ? previewActiveHref : undefined} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav onMenuClick={() => setMobileOpen(true)} pageTitle={pageTitle} unreadCount={unreadCount} preview={preview} />
        <main id="workspace-content" tabIndex={-1} className="min-h-0 flex-1 overflow-y-auto p-4 pb-8 sm:p-6 lg:p-8">
          <div className="crm-content">{children}</div>
        </main>
      </div>
    </div>
  );
}
