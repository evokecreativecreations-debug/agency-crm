import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * loading.tsx for /projects/[id] — shown automatically while the
 * project (and its client) are being fetched server-side.
 */
export default function ProjectDetailLoading() {
  return (
    <DashboardShell pageTitle="Project">
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="space-y-3 pt-5">
              <Skeleton className="h-4 w-40" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 pt-5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-36" />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}