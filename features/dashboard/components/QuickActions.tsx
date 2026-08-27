"use client";

import Link from "next/link";
import {
  ArrowRight,
  FilePlus2,
  Mail,
  Plus,
  UserPlus,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { BodySm } from "@/components/ui/Typography";

const actions = [
  {
    label: "New inquiry",
    description: "Add a new client inquiry",
    href: "/inquiries",
    icon: Mail,
  },
  {
    label: "New lead",
    description: "Create a lead",
    href: "/leads",
    icon: UserPlus,
  },
  {
    label: "New project",
    description: "Start a project",
    href: "/projects",
    icon: Plus,
  },
  {
    label: "New invoice",
    description: "Create an invoice",
    href: "/invoices",
    icon: FilePlus2,
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
      </CardHeader>

      <CardContent className="grid gap-3 sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.label}
              href={action.href}
              className="inline-flex h-auto min-h-16 items-center justify-between gap-3 rounded-md border border-line-strong bg-surface px-4 py-3 text-left transition-colors hover:bg-paper"
            >
              <span className="flex items-center gap-3">
                <Icon
                  className="h-4 w-4 shrink-0 text-ink"
                  aria-hidden="true"
                />

                <span>
                  <span className="block text-sm font-medium text-ink">
                    {action.label}
                  </span>

                  <BodySm className="mt-0.5">
                    {action.description}
                  </BodySm>
                </span>
              </span>

              <ArrowRight
                className="h-4 w-4 shrink-0 text-slate"
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}