"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { useState, type ReactNode } from "react";

interface DashboardShellProps {
  children: ReactNode;
  pageTitle?: string;
  unreadCount?: number;
}

/**
 * DashboardShell — wraps every page inside the (dashboard) route group.
 * Handles responsive layout: sidebar fixed + collapsible on desktop,
 * drawer on mobile. Active nav item and breadcrumbs are derived
 * automatically from the current URL — no need to pass them in.
 *
 * Usage:
 *   <DashboardShell pageTitle="Leads">
 *     ...page content...
 *   </DashboardShell>
 */
export function DashboardShell({ children, pageTitle, unreadCount }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-dvh w-full bg-paper">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav
          onMenuClick={() => setMobileOpen(true)}
          pageTitle={pageTitle}
          unreadCount={unreadCount}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
