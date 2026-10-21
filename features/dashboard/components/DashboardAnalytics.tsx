import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import type { DashboardAnalytics as Analytics } from "@/features/dashboard/api";
import { ArrowUpRight, BriefcaseBusiness, CheckCheck, CircleDollarSign, ListChecks, Users } from "lucide-react";

interface DashboardAnalyticsProps { analytics: Analytics }
function currency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}
function percentage(value: number, total: number) {
  return total > 0 ? Math.min(100, Math.max(0, (value / total) * 100)) : 0;
}
function Progress({ value, label }: { value: number; label: string }) {
  return <div className="crm-track" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)}><span style={{ width: `${value}%` }} /></div>;
}

export function DashboardAnalytics({ analytics }: DashboardAnalyticsProps) {
  const collected = percentage(analytics.totalPaid, analytics.totalInvoiced);
  const projectsDone = percentage(analytics.completedProjects, analytics.totalProjects);
  const tasksDone = percentage(analytics.completedTasks, analytics.totalTasks);
  const metrics = [
    { title: "Total leads", value: analytics.totalLeads.toLocaleString(), detail: `${analytics.wonLeads} won`, note: `${analytics.conversionRate.toFixed(1)}% conversion`, icon: Users, href: "/leads" },
    { title: "Projects", value: analytics.totalProjects.toLocaleString(), detail: `${analytics.activeProjects} active`, note: `${analytics.completedProjects} completed`, icon: BriefcaseBusiness, href: "/projects" },
    { title: "Tasks", value: analytics.totalTasks.toLocaleString(), detail: `${analytics.completedTasks} completed`, note: `${analytics.taskCompletionRate.toFixed(0)}% complete`, icon: ListChecks, href: "/projects" },
    { title: "Outstanding", value: currency(analytics.outstandingRevenue), detail: "Awaiting payment", note: "View payments", icon: CircleDollarSign, href: "/payments" },
  ];

  return (
    <section aria-label="Business overview" className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Link key={metric.title} href={metric.href} className="group rounded-[var(--radius-lg)] focus-visible:outline-offset-4">
            <Card className="h-full transition-colors hover:border-line-strong">
              <CardContent className="p-4 sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6">
                  <p className="text-sm font-medium text-slate">{metric.title}</p>
                  <span className="hidden h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-paper sm:flex text-slate transition-colors group-hover:bg-signal-soft group-hover:text-signal"><metric.icon className="h-4.5 w-4.5" aria-hidden="true" /></span>
                </div>
                <p className="crm-metric text-ink">{metric.value}</p>
                <div className="mt-4 flex flex-col items-start gap-2 border-t border-line pt-3 sm:mt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:pt-4">
                  <span className="text-xs text-slate">{metric.detail}</span>
                  <span className="flex items-center gap-1 text-xs font-medium text-signal">{metric.note}<ArrowUpRight className="h-3 w-3" aria-hidden="true" /></span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardContent className="flex h-full flex-col">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div><h2 className="crm-section-title text-ink">Financial overview</h2><p className="mt-1 text-xs text-slate">A clear picture of your agency&apos;s cash flow.</p></div>
              <span className="shrink-0 rounded-full border border-line px-2.5 py-1 text-xs text-slate">All time</span>
            </div>
            <p className="text-xs font-medium text-slate">Total invoiced</p>
            <p className="crm-financial mt-2 text-ink">{currency(analytics.totalInvoiced)}</p>
            <div className="mt-8 flex items-center justify-between gap-3 text-xs"><span className="text-slate">Payment collection</span><span className="font-medium tabular-nums text-ink">{collected.toFixed(0)}%</span></div>
            <div className="mt-3"><Progress value={collected} label="Percentage of invoiced value collected" /></div>
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-5">
              <div><p className="flex items-center gap-2 text-xs text-slate"><span className="h-2 w-2 rounded-full bg-signal" aria-hidden="true" />Received</p><p className="mt-2 text-lg font-semibold tracking-tight text-ink tabular-nums">{currency(analytics.totalPaid)}</p></div>
              <div className="border-l border-line pl-6"><p className="flex items-center gap-2 text-xs text-slate"><span className="h-2 w-2 rounded-full bg-line-strong" aria-hidden="true" />Outstanding</p><p className="mt-2 text-lg font-semibold tracking-tight text-ink tabular-nums">{currency(analytics.outstandingRevenue)}</p></div>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardContent className="flex h-full flex-col">
            <div className="mb-8 flex items-center justify-between gap-3"><div><h2 className="crm-section-title text-ink">Work in motion</h2><p className="mt-1 text-xs text-slate">From first brief to final delivery.</p></div><CheckCheck className="h-5 w-5 text-slate" aria-hidden="true" /></div>
            <div className="space-y-7">
              <div>
                <div className="mb-3 flex items-center justify-between gap-3"><p className="text-sm font-medium text-ink">Project delivery</p><span className="text-xs tabular-nums text-slate">{analytics.completedProjects} / {analytics.totalProjects}</span></div>
                <Progress value={projectsDone} label="Project completion" />
                <p className="mt-2 text-xs text-slate">{analytics.activeProjects} active projects</p>
              </div>
              <div>
                <div className="mb-3 flex items-center justify-between gap-3"><p className="text-sm font-medium text-ink">Task completion</p><span className="text-xs tabular-nums text-slate">{analytics.completedTasks} / {analytics.totalTasks}</span></div>
                <Progress value={tasksDone} label="Task completion" />
                <p className="mt-2 text-xs text-slate">{Math.max(0, analytics.totalTasks - analytics.completedTasks)} tasks remaining</p>
              </div>
            </div>
            <Link href="/projects" className="mt-7 flex min-h-11 items-center justify-between border-t border-line pt-4 text-xs font-medium text-signal hover:underline">View your projects<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
