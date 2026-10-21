import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { DashboardAnalytics } from "@/features/dashboard/components/DashboardAnalytics";
import { QuickActions } from "@/features/dashboard/components/QuickActions";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { CalendarDays } from "lucide-react";

// Explicit sample data for the public design reference, never live CRM records.
export default function LayoutPreviewPage() {
  return (
    <DashboardShell pageTitle="Dashboard" preview>
      <div className="space-y-8">
        <PageHeader eyebrow="Design preview · Sample data" title="Overview" description="A clear view of your sales, client work and cash flow."
          actions={<div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-line bg-surface px-3 py-2"><CalendarDays className="h-4 w-4 text-slate" aria-hidden="true" /><span className="text-xs text-slate">Workspace overview</span></div>} />
        <DashboardAnalytics analytics={{totalLeads:48,wonLeads:18,conversionRate:37.5,totalProjects:24,activeProjects:8,completedProjects:16,totalTasks:86,completedTasks:62,taskCompletionRate:72.1,totalInvoiced:42500,totalPaid:34250,outstandingRevenue:8250}} />
        <QuickActions />
        <section aria-labelledby="table-preview-title" className="space-y-4">
          <div className="flex items-center justify-between gap-3"><h2 id="table-preview-title" className="crm-section-title text-ink">Client list · component preview</h2><span className="text-xs text-slate">Sample records</span></div>
          <Table><TableHead><TableRow><TableHeaderCell>Client</TableHeaderCell><TableHeaderCell>Project</TableHeaderCell><TableHeaderCell>Status</TableHeaderCell><TableHeaderCell>Invoice</TableHeaderCell></TableRow></TableHead>
            <TableBody>
              <TableRow><TableCell><span className="font-medium">Northstar Studio</span><span className="mt-1 block text-xs text-slate">Brand identity</span></TableCell><TableCell>Visual identity system</TableCell><TableCell><Badge variant="project">In progress</Badge></TableCell><TableCell className="tabular-nums">$2,400</TableCell></TableRow>
              <TableRow><TableCell><span className="font-medium">Arcade Works</span><span className="mt-1 block text-xs text-slate">Game studio</span></TableCell><TableCell>Inventory interface</TableCell><TableCell><Badge variant="success">Completed</Badge></TableCell><TableCell className="tabular-nums">$3,200</TableCell></TableRow>
            </TableBody>
          </Table>
        </section>
      </div>
    </DashboardShell>
  );
}
