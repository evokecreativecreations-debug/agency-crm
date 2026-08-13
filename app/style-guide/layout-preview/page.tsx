import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Plus } from "lucide-react";

/**
 * /style-guide/layout-preview — shows Sidebar + TopNav + PageHeader working
 * together via DashboardShell, with placeholder content. Resize the
 * browser (or view on your phone) to see the sidebar collapse into a
 * drawer below the "md" breakpoint. Not a real feature/page.
 */
export default function LayoutPreviewPage() {
  return (
    <DashboardShell pageTitle="Dashboard" unreadCount={3}>
      <PageHeader
        eyebrow="Overview"
        title="Good morning, Rameez"
        description="Here's what's happening across your agency."
        actions={
          <>
            <Button size="sm" variant="outline">
              <Plus className="h-3.5 w-3.5" /> New Lead
            </Button>
            <Button size="sm" variant="outline">
              <Plus className="h-3.5 w-3.5" /> New Client
            </Button>
            <Button size="sm">
              <Plus className="h-3.5 w-3.5" /> New Project
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["New Inquiries", "4", "neutral"],
          ["Active Leads", "7", "info"],
          ["Active Projects", "5", "project"],
          ["Unpaid Invoices", "2", "warning"],
        ].map(([label, value, variant]) => (
          <Card key={label as string}>
            <CardContent>
              <p className="text-xs font-medium uppercase tracking-wide text-slate">
                {label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
              <Badge variant={variant as never} className="mt-2">
                Live
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate">
              This is placeholder content only — the real Activity Log feed
              is built in Phase 11.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
