import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Body, BodySm, H3, Mono } from "@/components/ui/Typography";
import type { DashboardAnalytics as DashboardAnalyticsData } from "@/features/dashboard/api";
import {
  BriefcaseBusiness,
  CircleDollarSign,
  ListChecks,
  TrendingUp,
  Users,
} from "lucide-react";

interface DashboardAnalyticsProps {
  analytics: DashboardAnalyticsData;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function DashboardAnalytics({
  analytics,
}: DashboardAnalyticsProps) {
  const metrics = [
    {
      title: "Leads",
      value: analytics.totalLeads.toLocaleString(),
      helper: `${analytics.wonLeads} won`,
      badge: `${analytics.conversionRate.toFixed(1)}% conversion`,
      variant: "lead" as const,
      icon: Users,
    },
    {
      title: "Projects",
      value: analytics.totalProjects.toLocaleString(),
      helper: `${analytics.activeProjects} active`,
      badge: `${analytics.completedProjects} completed`,
      variant: "project" as const,
      icon: BriefcaseBusiness,
    },
    {
      title: "Tasks",
      value: analytics.totalTasks.toLocaleString(),
      helper: `${analytics.completedTasks} completed`,
      badge: `${analytics.taskCompletionRate.toFixed(0)}% done`,
      variant: "info" as const,
      icon: ListChecks,
    },
    {
      title: "Outstanding",
      value: formatCurrency(analytics.outstandingRevenue),
      helper: "Awaiting payment",
      badge: "Receivables",
      variant: "warning" as const,
      icon: CircleDollarSign,
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <H3>Business Overview</H3>
          <BodySm className="mt-1">
            Your agency at a glance — sales, delivery and cash flow.
          </BodySm>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-slate sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-signal" />
          Live data
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <Card
              key={metric.title}
              className="group overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
            >
              <CardContent className="relative space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-surface">
                    <Icon className="h-5 w-5 text-ink" aria-hidden="true" />
                  </div>

                  <Badge variant={metric.variant}>
                    {metric.badge}
                  </Badge>
                </div>

                <div>
                  <BodySm className="text-slate">
                    {metric.title}
                  </BodySm>

                  <Mono className="mt-1 block text-3xl font-semibold tracking-tight text-ink">
                    {metric.value}
                  </Mono>
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-signal" />
                  <Body className="text-xs text-slate">
                    {metric.helper}
                  </Body>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex h-full flex-col justify-between gap-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <BodySm className="text-slate">
                  Total Invoiced
                </BodySm>

                <Mono className="mt-2 block text-3xl font-semibold tracking-tight text-ink">
                  {formatCurrency(analytics.totalInvoiced)}
                </Mono>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-surface">
                <TrendingUp className="h-5 w-5 text-ink" />
              </div>
            </div>

            <Body className="text-xs text-slate">
              Total value of all invoices issued.
            </Body>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardContent className="flex h-full flex-col justify-between gap-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <BodySm className="text-slate">
                  Total Paid
                </BodySm>

                <Mono className="mt-2 block text-3xl font-semibold tracking-tight text-ink">
                  {formatCurrency(analytics.totalPaid)}
                </Mono>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-surface">
                <CircleDollarSign className="h-5 w-5 text-ink" />
              </div>
            </div>

            <Body className="text-xs text-slate">
              Payments successfully received.
            </Body>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardContent className="flex h-full flex-col justify-between gap-6">
            <div>
              <BodySm className="text-slate">
                Outstanding Balance
              </BodySm>

              <Mono className="mt-2 block text-3xl font-semibold tracking-tight text-ink">
                {formatCurrency(analytics.outstandingRevenue)}
              </Mono>
            </div>

            <div className="flex items-center justify-between gap-3">
              <Body className="text-xs text-slate">
                Currently awaiting payment.
              </Body>

              <Badge variant="warning">
                Due
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}