import { Card, CardContent } from "@/components/ui/Card";
import { Body, BodySm, H3, Mono } from "@/components/ui/Typography";
import type { DashboardAnalytics as DashboardAnalyticsData } from "@/features/dashboard/api";

interface DashboardAnalyticsProps {
  analytics: DashboardAnalyticsData;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function DashboardAnalytics({
  analytics,
}: DashboardAnalyticsProps) {
  const widgets = [
    {
      label: "Total Leads",
      value: analytics.totalLeads.toLocaleString(),
      description: `${analytics.wonLeads} won`,
    },
    {
      label: "Conversion Rate",
      value: `${analytics.conversionRate.toFixed(1)}%`,
      description: `${analytics.wonLeads} won leads`,
    },
    {
      label: "Total Invoiced",
      value: formatCurrency(analytics.totalInvoiced),
      description: "Across all invoices",
    },
    {
      label: "Total Paid",
      value: formatCurrency(analytics.totalPaid),
      description: "Payments received",
    },
    {
      label: "Outstanding",
      value: formatCurrency(analytics.outstandingRevenue),
      description: "Invoiced minus paid",
    },
  ];

  return (
    <section className="space-y-3">
      <div>
        <H3>Performance overview</H3>
        <BodySm className="mt-1">
          Key sales and revenue metrics across your agency.
        </BodySm>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {widgets.map((widget) => (
          <Card key={widget.label}>
            <CardContent>
              <BodySm>{widget.label}</BodySm>

              <Mono className="mt-2 block text-xl font-semibold">
                {widget.value}
              </Mono>

              <Body className="mt-1 text-xs text-slate">
                {widget.description}
              </Body>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}