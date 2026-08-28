import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Body, BodySm, H3, Mono } from "@/components/ui/Typography";
import type { DashboardAnalytics as DashboardAnalyticsData } from "@/features/dashboard/api";

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
      badge: `${analytics.conversionRate.toFixed(1)}%`,
      variant: "lead" as const,
    },
    {
      title: "Projects",
      value: analytics.totalProjects.toLocaleString(),
      helper: `${analytics.activeProjects} active`,
      badge: `${analytics.completedProjects} done`,
      variant: "project" as const,
    },
    {
      title: "Tasks",
      value: analytics.totalTasks.toLocaleString(),
      helper: `${analytics.completedTasks} completed`,
      badge: `${analytics.taskCompletionRate.toFixed(0)}%`,
      variant: "info" as const,
    },
    {
      title: "Outstanding",
      value: formatCurrency(analytics.outstandingRevenue),
      helper: "Awaiting payment",
      badge: "Revenue",
      variant: "warning" as const,
    },
  ];

  return (
    <section className="space-y-6">
      <div>
        <H3>Business Overview</H3>

        <BodySm className="mt-1">
          Live pipeline, project progress and financial snapshot.
        </BodySm>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between">
                <BodySm>{metric.title}</BodySm>

                <Badge variant={metric.variant}>
                  {metric.badge}
                </Badge>
              </div>

              <Mono className="block text-3xl font-semibold">
                {metric.value}
              </Mono>

              <Body className="text-slate text-xs">
                {metric.helper}
              </Body>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-2">
            <BodySm>Total Invoiced</BodySm>

            <Mono className="block text-3xl font-semibold">
              {formatCurrency(analytics.totalInvoiced)}
            </Mono>

            <Body className="text-xs text-slate">
              Total value of all invoices issued.
            </Body>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2">
            <BodySm>Total Paid</BodySm>

            <Mono className="block text-3xl font-semibold">
              {formatCurrency(analytics.totalPaid)}
            </Mono>

            <Body className="text-xs text-slate">
              Payments successfully received.
            </Body>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}