"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Body } from "@/components/ui/Typography";
import { useAuth } from "@/features/auth/useAuth";

/**
 * /dashboard — minimal authenticated landing page. This confirms the
 * Authentication feature works end-to-end (login → redirect → protected
 * page → shows the real logged-in user). The real Dashboard Analytics
 * widgets, Recent Activity, and Quick Actions are built in later phases.
 */
export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <DashboardShell pageTitle="Dashboard">
      <PageHeader eyebrow="Overview" title="Welcome back" />
      <Card>
        <CardContent>
          <Body>You&rsquo;re signed in as:</Body>
          <Body className="mt-1 font-medium text-ink">{user?.email}</Body>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
