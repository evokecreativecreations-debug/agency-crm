"use client";

import { cn } from "@/lib/utils";
import { navItems } from "@/lib/navigation";
import { Building2, ChevronsLeft, ChevronsRight, Layers2, LockKeyhole, Settings2, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  activeHref?: string;
}
const COLLAPSE_STORAGE_KEY = "agency-crm:sidebar-collapsed";
const groups = [
  { label: "Workspace", paths: ["/today", "/dashboard", "/inquiries", "/leads", "/clients"] },
  { label: "Manage", paths: ["/projects", "/messages", "/services"] },
  { label: "Finance", paths: ["/quotations", "/invoices", "/payments"] },
];

export function Sidebar({ mobileOpen = false, onMobileClose, activeHref }: SidebarProps) {
  const pathname = usePathname();
  const drawerRef = useRef<HTMLElement>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Subscribe to a stored preference without a server/client hydration mismatch.
    const timer = window.setTimeout(() => {
      setCollapsed(window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === "true");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const trigger = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onMobileClose?.();
      if (event.key !== "Tab") return;
      const elements = drawerRef.current?.querySelectorAll<HTMLElement>("a[href],button:not([disabled])");
      if (!elements?.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [mobileOpen, onMobileClose]);

  function toggleCollapsed() {
    setCollapsed((current) => {
      window.localStorage.setItem(COLLAPSE_STORAGE_KEY, String(!current));
      return !current;
    });
  }
  function isActive(href: string) {
    const current = activeHref ?? pathname;
    return current === href || (href !== "/dashboard" && current?.startsWith(`${href}/`));
  }
  function brand(showLabels: boolean) {
    return (
      <Link href="/dashboard" aria-label="Agency CRM dashboard" className={cn("flex items-center gap-3", !showLabels && "justify-center")}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-signal text-on-signal">
          <Layers2 className="h-5 w-5" aria-hidden="true" />
        </span>
        {showLabels && <span className="text-base font-semibold tracking-tight text-ink">Agency<span className="ml-1 font-normal text-slate">CRM</span></span>}
      </Link>
    );
  }
  function navigation(showLabels: boolean) {
    return groups.map((group) => (
      <div key={group.label} className="mb-6 last:mb-0">
        {showLabels && <p className="mb-2 px-3 text-xs font-medium text-muted">{group.label}</p>}
        <ul className="space-y-1">
          {group.paths.map((href) => {
            const item = navItems.find((entry) => entry.href === href)!;
            const active = isActive(href);
            return (
              <li key={href}>
                <Link href={href} onClick={onMobileClose} aria-label={item.label} aria-current={active ? "page" : undefined} title={!showLabels ? item.label : undefined}
                  className={cn("flex min-h-11 items-center gap-3 rounded-[var(--radius-md)] px-3 text-sm font-medium transition-colors", !showLabels && "justify-center", active ? "bg-signal-soft text-signal" : "text-slate hover:bg-sidebar-hover hover:text-ink")}>
                  <item.icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                  {showLabels && <span className="flex-1">{item.label}</span>}
                  {showLabels && active && <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden="true" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    ));
  }
  function footer(showLabels: boolean) {
    return (
      <Link href="/settings" onClick={onMobileClose} aria-label="Settings" title={!showLabels ? "Settings" : undefined}
        className={cn("flex min-h-11 items-center gap-3 rounded-[var(--radius-md)] px-3 text-sm text-slate transition-colors hover:bg-sidebar-hover hover:text-ink", !showLabels && "justify-center")}>
        <Settings2 className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />{showLabels && "Settings"}
      </Link>
    );
  }
  return (
    <>
      <aside className={cn("hidden shrink-0 flex-col border-r border-line bg-sidebar transition-[width] duration-200 md:flex", collapsed ? "w-[var(--sidebar-width-collapsed)]" : "w-[var(--sidebar-width)]")}>
        <div className="flex h-20 shrink-0 items-center px-6">{brand(!collapsed)}</div>
        {!collapsed && <div className="mx-4 mb-6 flex items-center gap-3 rounded-[var(--radius-md)] border border-line p-3">
          <Building2 className="h-5 w-5 shrink-0 text-slate" aria-hidden="true" />
          <div className="min-w-0"><p className="truncate text-xs font-semibold text-ink">Agency workspace</p><p className="mt-1 flex items-center gap-1 text-xs text-slate"><LockKeyhole className="h-3 w-3" aria-hidden="true" />Private workspace</p></div>
        </div>}
        <nav className="min-h-0 flex-1 overflow-y-auto px-4 pb-4" aria-label="Primary">{navigation(!collapsed)}</nav>
        <div className="shrink-0 border-t border-line p-4">
          {footer(!collapsed)}
          <button type="button" onClick={toggleCollapsed} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} className={cn("mt-1 flex min-h-11 w-full items-center gap-3 rounded-[var(--radius-md)] px-3 text-sm text-slate hover:bg-sidebar-hover hover:text-ink", collapsed && "justify-center")}>
            {collapsed ? <ChevronsRight className="h-4.5 w-4.5" aria-hidden="true" /> : <ChevronsLeft className="h-4.5 w-4.5" aria-hidden="true" />}{!collapsed && "Collapse sidebar"}
          </button>
        </div>
      </aside>
      {mobileOpen && <div className="fixed inset-0 z-50 md:hidden">
        <div className="absolute inset-0 bg-overlay/40" onClick={onMobileClose} aria-hidden="true" />
        <aside ref={drawerRef} role="dialog" aria-modal="true" aria-label="Navigation" className="absolute inset-y-0 left-0 flex w-[var(--sidebar-width)] max-w-full flex-col bg-sidebar shadow-[var(--shadow-dialog)]">
          <div className="flex h-20 shrink-0 items-center justify-between px-5">{brand(true)}<button type="button" onClick={onMobileClose} aria-label="Close menu" className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] text-slate hover:bg-sidebar-hover"><X className="h-5 w-5" aria-hidden="true" /></button></div>
          <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-4" aria-label="Primary">{navigation(true)}</nav>
          <div className="border-t border-line p-4">{footer(true)}</div>
        </aside>
      </div>}
    </>
  );
}
