import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
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
      <div className="space-y-8">
        <PageHeader
          eyebrow="Your workspace"
          title="Overview"
          description="A clear view of your sales, client work and cash flow."
          actions={
            <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-line bg-surface px-3 py-2">
              <CalendarDays
                className="h-4 w-4 text-slate"
                aria-hidden="true"
              />

              <span className="whitespace-nowrap text-xs text-slate">
                {today}
              </span>
            </div>
          }
        />

        <DashboardAnalytics analytics={analytics} />

        <QuickActions />

        <p className="text-xs text-slate">All-time totals from your agency&apos;s recorded activity.</p>
      </div>
    </DashboardShell>
  );
}
