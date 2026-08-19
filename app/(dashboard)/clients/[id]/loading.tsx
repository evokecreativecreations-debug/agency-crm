import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * loading.tsx for /clients/[id] — shown automatically while the client
 * (and its related lead) are being fetched server-side.
 */
export default function ClientDetailLoading() {
  return (
    <DashboardShell pageTitle="Client">
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-8 w-56" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="space-y-3 pt-5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 pt-5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-44" />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}