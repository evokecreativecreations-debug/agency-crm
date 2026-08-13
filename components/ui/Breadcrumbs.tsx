"use client";

import { getBreadcrumbs } from "@/lib/navigation";
import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

interface BreadcrumbsProps {
  /** Optional manual override. If omitted, breadcrumbs are derived from the current URL. */
  items?: { label: string; href: string }[];
}

/**
 * Breadcrumbs — shown in TopNav above the page title on nested routes
 * (e.g. Dashboard / Clients / Acme Co.). Auto-derived from the URL via
 * lib/navigation.ts, or pass `items` to override (e.g. once a client's
 * real name is loaded instead of its id).
 */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const pathname = usePathname();
  const crumbs = items ?? getBreadcrumbs(pathname);

  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="hidden md:block">
      <ol className="flex items-center gap-1.5 text-xs text-slate">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={crumb.href} className="flex items-center gap-1.5">
              {index > 0 && <ChevronRight className="h-3 w-3 text-muted" aria-hidden="true" />}
              {isLast ? (
                <span className="font-medium text-ink" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <a href={crumb.href} className="transition-colors hover:text-ink">
                  {crumb.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
