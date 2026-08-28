import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { BodySm } from "@/components/ui/Typography";
import { DashboardAnalytics } from "@/features/dashboard/components/DashboardAnalytics";
import { QuickActions } from "@/features/dashboard/components/QuickActions";
import { getDashboardAnalytics } from "@/features/dashboard/api";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const analytics = await getDashboardAnalytics(supabase);

  return (
    <DashboardShell pageTitle="Dashboard">
      <div className="space-y-8">
        <PageHeader
          eyebrow="Agency CRM"
          title="Dashboard"
          description="Monitor sales, projects and revenue from one place."
        />

        <DashboardAnalytics analytics={analytics} />

        <QuickActions />

        <div className="rounded-[var(--radius-lg)] border border-line bg-paper px-5 py-4">
          <BodySm>
            Dashboard metrics are calculated live from Leads, Projects,
            Tasks, Invoices and Payments. Refresh the page after making
            changes to see updated totals.
          </BodySm>
        </div>
      </div>
    </DashboardShell>
  );
}