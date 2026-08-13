"use client";

import { cn } from "@/lib/utils";
import { navItems } from "@/lib/navigation";
import { ChevronsLeft, ChevronsRight, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface SidebarProps {
  /** Mobile only: whether the drawer is open. Ignored on desktop (always visible). */
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const COLLAPSE_STORAGE_KEY = "agency-crm:sidebar-collapsed";

/**
 * Sidebar — primary navigation.
 * - Desktop (md+): always visible, collapsible to an icon-only rail via
 *   the toggle at the bottom. Collapsed state persists across visits.
 * - Mobile: hidden by default, slides in as a drawer controlled by
 *   `mobileOpen`/`onMobileClose` (toggled from TopNav's hamburger).
 * - Active route is highlighted automatically from the current URL.
 */
export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  // Starts false to match the server-rendered markup, then syncs from
  // localStorage once mounted on the client (avoids a hydration mismatch).
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(COLLAPSE_STORAGE_KEY);
    if (stored === "true") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from a client-only persisted preference on mount, not a cascading-render pattern.
      setCollapsed(true);
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(COLLAPSE_STORAGE_KEY, String(next));
      return next;
    });
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function renderNav(showLabels: boolean) {
    return (
      <ul className="flex flex-col gap-0.5">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <a
                href={item.href}
                aria-current={active ? "page" : undefined}
                title={showLabels ? undefined : item.label}
                className={cn(
                  "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors",
                  !showLabels && "justify-center px-2",
                  active
                    ? "bg-signal-soft text-signal"
                    : "text-slate hover:bg-paper hover:text-ink"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {showLabels && item.label}
                {showLabels && active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-signal" aria-hidden="true" />
                )}
              </a>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden shrink-0 border-r border-line bg-surface transition-[width] duration-200 md:flex md:flex-col",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <div className={cn("flex items-center px-2 py-3", collapsed ? "justify-center" : "justify-between")}>
          {!collapsed && (
            <span className="text-sm font-semibold tracking-tight text-ink">Agency CRM</span>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto p-3 pt-0" aria-label="Primary">
          {renderNav(!collapsed)}
        </nav>
        <div className="border-t border-line p-3">
          <button
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex w-full items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm text-slate transition-colors hover:bg-paper hover:text-ink",
              collapsed && "justify-center px-2"
            )}
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            {!collapsed && "Collapse"}
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={onMobileClose} aria-hidden="true" />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-surface shadow-[var(--shadow-dialog)]">
            <div className="flex items-center justify-between px-2 py-3">
              <span className="text-sm font-semibold tracking-tight text-ink">Agency CRM</span>
              <button
                onClick={onMobileClose}
                className="rounded-[var(--radius-sm)] p-1 text-slate hover:bg-paper"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 pt-0" aria-label="Primary">
              {renderNav(true)}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
