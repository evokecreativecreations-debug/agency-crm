import {
  Briefcase,
  FileText,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  Tag,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/**
 * Single source of truth for primary navigation.
 * Mirrors the frozen module list in PROJECT.md.
 */
export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Inquiries", href: "/inquiries", icon: Inbox },
  { label: "Leads", href: "/leads", icon: Users },
  { label: "Clients", href: "/clients", icon: Briefcase },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Invoices", href: "/invoices", icon: FileText },
  { label: "Payments", href: "/payments", icon: Wallet },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Services", href: "/services", icon: Tag },
];

/** Returns the nav item whose href matches (or prefixes) the given pathname. */
export function getActiveNavItem(
  pathname: string,
): NavItem | undefined {
  return navItems.find(
    (item) =>
      pathname === item.href ||
      pathname.startsWith(`${item.href}/`),
  );
}

export interface BreadcrumbItem {
  label: string;
  href: string;
}

/**
 * Builds breadcrumb items from a pathname,
 * e.g. "/clients/123" -> Dashboard / Clients / 123.
 */
export function getBreadcrumbs(
  pathname: string,
): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return [{ label: "Dashboard", href: "/dashboard" }];
  }

  return segments.map((segment, index) => {
    const href =
      "/" + segments.slice(0, index + 1).join("/");

    const matched = navItems.find(
      (item) => item.href === href,
    );

    const label =
      matched?.label ??
      segment.charAt(0).toUpperCase() + segment.slice(1);

    return { label, href };
  });
}
