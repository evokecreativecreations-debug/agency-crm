"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  FilePlus2,
  FolderKanban,
  Mail,
  Receipt,
  UserPlus,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BodySm } from "@/components/ui/Typography";

const actions = [
  {
    title: "New Inquiry",
    description: "Capture a new client inquiry.",
    href: "/inquiries",
    icon: Mail,
    badge: "Inbox",
    variant: "inquiry" as const,
  },
  {
    title: "New Lead",
    description: "Convert an inquiry into a lead.",
    href: "/leads",
    icon: UserPlus,
    badge: "Sales",
    variant: "lead" as const,
  },
  {
    title: "New Project",
    description: "Start work for an existing client.",
    href: "/projects",
    icon: FolderKanban,
    badge: "Delivery",
    variant: "project" as const,
  },
  {
    title: "New Invoice",
    description: "Bill completed work.",
    href: "/invoices",
    icon: FilePlus2,
    badge: "Finance",
    variant: "invoice" as const,
  },
  {
    title: "Payments",
    description: "Review received payments.",
    href: "/payments",
    icon: Receipt,
    badge: "Cash",
    variant: "paid" as const,
  },
];

export function QuickActions() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-line">
        <div>
          <CardTitle>Quick Actions</CardTitle>
          <BodySm className="mt-1">
            Jump straight into your most common workflows.
          </BodySm>
        </div>
      </CardHeader>

      <CardContent className="grid gap-3 pt-5 sm:grid-cols-2 xl:grid-cols-5">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="group rounded-[var(--radius-md)] border border-line bg-paper p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:bg-surface hover:shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-surface transition-transform duration-200 group-hover:scale-105">
                  <Icon
                    className="h-5 w-5 text-ink"
                    aria-hidden="true"
                  />
                </div>

                <ArrowUpRight
                  className="h-4 w-4 text-slate transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                  aria-hidden="true"
                />
              </div>

              <div className="mt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-ink">
                    {action.title}
                  </h3>

                  <Badge variant={action.variant}>
                    {action.badge}
                  </Badge>
                </div>

                <BodySm className="mt-1.5">
                  {action.description}
                </BodySm>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}