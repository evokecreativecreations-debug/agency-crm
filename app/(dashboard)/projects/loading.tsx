import { DashboardShell } from "@/components/layout/DashboardShell";
import { Skeleton, TableRowSkeleton } from "@/components/ui/Skeleton";
import { Table, TableBody } from "@/components/ui/Table";

/**
 * loading.tsx — Next.js's built-in loading-state convention. Shown
 * automatically while /projects' server component fetches data, using
 * the same Skeleton/TableRowSkeleton pieces as /clients' loading state.
 */
export default function ProjectsLoading() {
  return (
    <DashboardShell pageTitle="Projects">
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
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