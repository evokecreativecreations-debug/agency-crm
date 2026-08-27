"use client";

import { cn } from "@/lib/utils";
import { navItems } from "@/lib/navigation";
import {
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const COLLAPSE_STORAGE_KEY = "agency-crm:sidebar-collapsed";

export function Sidebar({
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(
      COLLAPSE_STORAGE_KEY
    );

    if (stored === "true") {
      setCollapsed(true);
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;

      window.localStorage.setItem(
        COLLAPSE_STORAGE_KEY,
        String(next)
      );

      return next;
    });
  }

  function isActive(href: string): boolean {
    if (!pathname) {
      return false;
    }

    // Dashboard/root route needs exact matching.
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  function handleMobileNavigation() {
    onMobileClose?.();
  }

  function renderNav(showLabels: boolean) {
    return (
      <ul className="flex flex-col gap-0.5">
        {navItems.map((item) => {
          const active = isActive(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={handleMobileNavigation}
                aria-current={active ? "page" : undefined}
                title={
                  showLabels ? undefined : item.label
                }
                className={cn(
                  "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors",
                  "no-underline",
                  !showLabels && "justify-center px-2",
                  active
                    ? "!bg-signal-soft !text-signal"
                    : "!text-slate hover:!bg-paper hover:!text-ink"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    active
                      ? "!text-signal"
                      : "!text-slate"
                  )}
                  aria-hidden="true"
                />

                {showLabels && (
                  <span className="min-w-0 flex-1 truncate">
                    {item.label}
                  </span>
                )}

                {showLabels && active && (
                  <span
                    className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full !bg-signal"
                    aria-hidden="true"
                  />
                )}
              </Link>
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
        {/* Header */}
        <div
          className={cn(
            "flex items-center px-2 py-3",
            collapsed
              ? "justify-center"
              : "justify-between"
          )}
        >
          {!collapsed && (
            <span className="text-sm font-semibold tracking-tight !text-ink">
              Agency CRM
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 overflow-y-auto p-3 pt-0"
          aria-label="Primary"
        >
          {renderNav(!collapsed)}
        </nav>

        {/* Collapse button */}
        <div className="border-t border-line p-3">
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            className={cn(
              "flex w-full items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm transition-colors",
              "!text-slate hover:!bg-paper hover:!text-ink",
              collapsed && "justify-center px-2"
            )}
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <ChevronsLeft className="h-4 w-4" />
            )}

            {!collapsed && "Collapse"}
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={onMobileClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-surface shadow-[var(--shadow-dialog)]">
            {/* Mobile header */}
            <div className="flex items-center justify-between px-2 py-3">
              <span className="text-sm font-semibold tracking-tight !text-ink">
                Agency CRM
              </span>

              <button
                type="button"
                onClick={onMobileClose}
                className="rounded-[var(--radius-sm)] p-1 !text-slate hover:!bg-paper hover:!text-ink"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile navigation */}
            <nav
              className="flex-1 overflow-y-auto p-3 pt-0"
              aria-label="Primary"
            >
              {renderNav(true)}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}