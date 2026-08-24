import { DashboardShell } from "@/components/layout/DashboardShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Mono, H3 } from "@/components/ui/Typography";
import { PaymentsCardStandalone } from "@/app/(dashboard)/payments/components/PaymentsCardStandalone";
import { getInvoices } from "@/features/invoices/api";
import { getProjects } from "@/features/projects/api";
import { createClient } from "@/lib/supabase/server";
import { Receipt } from "lucide-react";
import Link from "next/link";

/**
 * /payments — protected by proxy.ts (see PROTECTED_PREFIXES). Same
 * pattern as /invoices: there's no "all payments" query in
 * features/payments/api.ts (payments are scoped per invoice), so this
 * page fetches every project, then that project's invoices, and renders
 * the existing PaymentsCard once per invoice — reused as-is via the
 * PaymentsCardStandalone wrapper (see that file for why the wrapper is
 * needed), with no changes to the Payments API or components themselves.
 */
export default async function PaymentsPage() {
  const supabase = await createClient();
  const projects = await getProjects(supabase);

  const projectsWithInvoices = await Promise.all(
    projects.map(async (project) => ({
      project,
      invoices: await getInvoices(supabase, project.id),
    }))
  );

  const allInvoices = projectsWithInvoices.flatMap(({ project, invoices }) =>
    invoices.map((invoice) => ({ project, invoice }))
  );

  return (
    <DashboardShell pageTitle="Payments">
      <PageHeader
        eyebrow="Billing"
        title="Payments"
        description="Every invoice's payment history, across all your projects."
      />

      {allInvoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No invoices yet"
          description="Payments are recorded against invoices. Create a project and an invoice first, then record payments here."
        />
      ) : (
        <div className="space-y-6">
          {allInvoices.map(({ project, invoice }) => (
            <div key={invoice.id}>
              <Link
                href={`/projects/${project.id}`}
                className="mb-2 inline-flex items-center gap-2 transition-colors hover:text-signal"
              >
                <H3>{project.title}</H3>
                <Mono className="text-slate">{invoice.invoice_number}</Mono>
              </Link>
              <PaymentsCardStandalone invoice={invoice} />
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}