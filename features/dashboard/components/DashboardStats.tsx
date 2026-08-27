"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { BodySm, H3, Mono } from "@/components/ui/Typography";

interface DashboardStatsProps {
  totalLeads: number;
  wonLeads: number;
  totalRevenue: number;
  outstandingRevenue: number;
}

export function DashboardStats({
  totalLeads,
  wonLeads,
  totalRevenue,
  outstandingRevenue,
}: DashboardStatsProps) {
  const conversionRate =
    totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

  const stats = [
    {
      label: "Total leads",
      value: totalLeads.toString(),
      helper: `${wonLeads} won`,
    },
    {
      label: "Conversion rate",
      value: `${conversionRate}%`,
      helper: "Leads converted to clients",
    },
    {
      label: "Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      helper: "Paid invoices",
    },
    {
      label: "Outstanding",
      value: `$${outstandingRevenue.toLocaleString()}`,
      helper: "Unpaid invoice balance",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent>
            <BodySm>{stat.label}</BodySm>
            <H3 className="mt-2">
              <Mono className="text-2xl font-semibold">{stat.value}</Mono>
            </H3>
            <BodySm className="mt-1">{stat.helper}</BodySm>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}