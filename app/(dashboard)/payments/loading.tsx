import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * loading.tsx — Next.js's built-in loading-state convention. Shown
 * automatically while /payments' server component fetches every
 * project's invoices. Mirrors the card-shaped layout the page actually
 * renders (a heading + a PaymentsCard per invoice), same approach as
 * /clients/[id]/loading.tsx and /projects/[id]/loading.tsx.
 */
export default function PaymentsLoading() {
  return (
    <DashboardShell pageTitle="Payments">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-7 w-32" />
      </div>
      <div className="space-y-6">
        {[0, 1].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Card>
              <CardContent className="space-y-4 pt-5">
                <div className="grid grid-cols-3 gap-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}