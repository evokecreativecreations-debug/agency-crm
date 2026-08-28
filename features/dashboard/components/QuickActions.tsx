"use client";

import Link from "next/link";
import {
  ArrowRight,
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
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>

      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="group rounded-[var(--radius-md)] border border-line bg-paper p-4 transition-all hover:border-line-strong hover:shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-surface">
                  <Icon className="h-5 w-5 text-ink" />
                </div>

                <Badge variant={action.variant}>
                  {action.badge}
                </Badge>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-semibold text-ink">
                  {action.title}
                </h3>

                <BodySm className="mt-1">
                  {action.description}
                </BodySm>
              </div>

              <div className="mt-4 flex items-center text-sm font-medium text-ink">
                Open

                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}