"use client";
import { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/Button";
import { TodayView } from "@/features/dashboard/components/TodayView";
import { buildToday } from "@/features/dashboard/today";
import { QuotationsView } from "@/features/invoices/components/QuotationsView";
import type { Quotation } from "@/types/billing";
const quote: Quotation = {
  id: "sample",
  quotation_number: "QUO-0024",
  client_id: "sample-client",
  lead_id: null,
  recipient_name: "Olivia Martin",
  recipient_email: "olivia@example.invalid",
  line_items: [
    {
      description: "Brand identity & visual direction",
      quantity: 1,
      unit_price: 1250,
    },
    { description: "Website design", quantity: 1, unit_price: 2400 },
  ],
  discount_amount: 150,
  tax_rate: 0,
  deposit_amount: 1750,
  notes: "Sample proposal. Final scope to be agreed with the client.",
  payment_terms: "50% advance, balance on completion.",
  amount: 3500,
  valid_until: "2026-11-05",
  status: "accepted",
  invoice_id: null,
  created_at: "2026-10-21T09:00:00Z",
};
const data = buildToday(
  {
    followups: [
      {
        id: "a",
        lead_id: "sample",
        user_id: "sample",
        action: "Discuss the brand proposal and confirm the next steps.",
        due_at: "2026-10-21T05:00:00Z",
        status: "pending",
        completed_at: null,
        created_at: "2026-10-20",
        leads: { full_name: "Olivia Martin", email: "olivia@example.invalid" },
      },
      {
        id: "b",
        lead_id: "sample2",
        user_id: "sample",
        action: "Send the revised website scope after our discovery call.",
        due_at: "2026-10-20T10:00:00Z",
        status: "pending",
        completed_at: null,
        created_at: "2026-10-20",
        leads: { full_name: "James Wilson", email: "james@example.invalid" },
      },
      {
        id: "c",
        lead_id: "sample3",
        user_id: "sample",
        action: "Check in on the campaign launch date.",
        due_at: "2026-10-23T05:00:00Z",
        status: "pending",
        completed_at: null,
        created_at: "2026-10-20",
        leads: { full_name: "Sophia Lee", email: "sophia@example.invalid" },
      },
    ],
    tasks: [
      {
        id: "a",
        project_id: "sample",
        title: "Review homepage concepts",
        due_date: "2026-10-21",
        status: "in_progress",
        assigned_to: null,
        projects: { title: "Meridian website" },
      },
      {
        id: "b",
        project_id: "sample",
        title: "Share the final brand assets",
        due_date: "2026-10-20",
        status: "todo",
        assigned_to: null,
        projects: { title: "Northstar identity" },
      },
    ],
    projects: [
      {
        id: "sample",
        title: "Meridian website",
        due_date: "2026-10-21",
        status: "in_progress",
      },
    ],
    invoices: [
      {
        id: "a",
        project_id: "sample",
        invoice_number: "INV-0048",
        amount: 2400,
        status: "partially_paid",
        due_date: "2026-10-20",
        payments: [{ amount: 1200 }],
      },
      {
        id: "b",
        project_id: "sample",
        invoice_number: "INV-0051",
        amount: 850,
        status: "sent",
        due_date: "2026-10-25",
        payments: [],
      },
    ],
  },
  new Date("2026-10-21T06:00:00Z"),
  "Asia/Karachi",
);
export default function WorkflowPreview() {
  const [view, setView] = useState<"today" | "quotations">("today");
  return (
    <DashboardShell
      pageTitle={view === "today" ? "Today" : "Quotations"}
      preview
      previewActiveHref={view === "today" ? "/today" : "/quotations"}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-signal-soft px-4 py-3">
        <p className="text-xs text-slate">
          Feature preview · sample data only · changes are not saved
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={view === "today" ? "primary" : "ghost"}
            onClick={() => setView("today")}
          >
            Today
          </Button>
          <Button
            size="sm"
            variant={view === "quotations" ? "primary" : "ghost"}
            onClick={() => setView("quotations")}
          >
            Quotations
          </Button>
        </div>
      </div>
      {view === "today" ? (
        <TodayView data={data} timeZone="Asia/Karachi" preview />
      ) : (
        <QuotationsView
          initialQuotes={[
            quote,
            {
              ...quote,
              id: "sample2",
              quotation_number: "QUO-0025",
              status: "draft",
              recipient_name: "James Wilson",
              recipient_email: "james@example.invalid",
              amount: 3500,
            },
          ]}
          leads={[]}
          clients={[
            {
              id: "sample-client",
              lead_id: null,
              full_name: "Olivia Martin",
              email: "olivia@example.invalid",
            },
          ]}
          projects={[
            {
              id: "sample-project",
              client_id: "sample-client",
              title: "Brand & website",
            },
          ]}
          preview
        />
      )}
    </DashboardShell>
  );
}
