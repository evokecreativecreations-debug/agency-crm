import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { BodySm } from "@/components/ui/Typography";
import { DashboardAnalytics } from "@/features/dashboard/components/DashboardAnalytics";
import { QuickActions } from "@/features/dashboard/components/QuickActions";
import { getDashboardAnalytics } from "@/features/dashboard/api";
import { createClient } from "@/lib/supabase/server";
import { CalendarDays } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const analytics = await getDashboardAnalytics(supabase);

  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <DashboardShell pageTitle="Dashboard">
      <div className="mx-auto w-full max-w-[1600px] space-y-8">
        <PageHeader
          eyebrow="Agency CRM"
          title="Dashboard"
          description="Monitor sales, projects and revenue from one place."
          actions={
            <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-line bg-surface px-3 py-2">
              <CalendarDays
                className="h-4 w-4 text-slate"
                aria-hidden="true"
              />

              <BodySm className="whitespace-nowrap text-slate">
                {today}
              </BodySm>
            </div>
          }
        />

        <DashboardAnalytics analytics={analytics} />

        <QuickActions />

        <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-line bg-surface px-5 py-4">
          <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-signal" />

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