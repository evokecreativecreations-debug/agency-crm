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
          eyebrow="Overview"
          title="Dashboard"
          description="A quick overview of your agency's pipeline and revenue."
        />

        <DashboardAnalytics analytics={analytics} />

        <QuickActions />

        <BodySm>
          Analytics are calculated from the current CRM records.
        </BodySm>
      </div>
    </DashboardShell>
  );
}