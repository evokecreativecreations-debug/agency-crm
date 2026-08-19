import { DashboardShell } from "@/components/layout/DashboardShell";
import { Skeleton, TableRowSkeleton } from "@/components/ui/Skeleton";
import { Table, TableBody } from "@/components/ui/Table";

/**
 * loading.tsx — Next.js's built-in loading-state convention. Shown
 * automatically while /clients' server component fetches data (e.g. on
 * a slow connection), using the same Skeleton/TableRowSkeleton pieces
 * from the design system rather than a generic spinner.
 */
export default function ClientsLoading() {
  return (
    <DashboardShell pageTitle="Clients">
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-7 w-32" />
        </div>
      </div>
      <Table>
        <TableBody>
          <TableRowSkeleton columns={5} />
          <TableRowSkeleton columns={5} />
          <TableRowSkeleton columns={5} />
          <TableRowSkeleton columns={5} />
        </TableBody>
      </Table>
    </DashboardShell>
  );
}