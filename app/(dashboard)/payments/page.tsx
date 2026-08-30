import { DashboardShell } from "@/components/layout/DashboardShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Mono, H3 } from "@/components/ui/Typography";
import { PaymentsCardStandalone } from "@/app/(dashboard)/payments/components/PaymentsCardStandalone";
import { getInvoices } from "@/features/invoices/api";
import { getProjects } from "@/features/projects/api";
import { createClient } from "@/lib/supabase/server";
import {
  CircleDollarSign,
  Clock3,
  FileText,
  Receipt,
} from "lucide-react";
import Link from "next/link";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default async function PaymentsPage() {
  const supabase = await createClient();
  const projects = await getProjects(supabase);

  const projectsWithInvoices = await Promise.all(
    projects.map(async (project) => ({
      project,
      invoices: await getInvoices(supabase, project.id),
    }))
  );

  const allInvoices = projectsWithInvoices.flatMap(
    ({ project, invoices }) =>
      invoices.map((invoice) => ({
        project,
        invoice,
      }))
  );

  const totalInvoiced = allInvoices.reduce(
    (sum, { invoice }) => sum + invoice.amount,
    0
  );

  const paidInvoices = allInvoices.filter(
    ({ invoice }) => invoice.status === "paid"
  ).length;

  const outstandingInvoices = allInvoices.filter(
    ({ invoice }) =>
      invoice.status === "sent" ||
      invoice.status === "partially_paid" ||
      invoice.status === "overdue"
  ).length;

  return (
    <DashboardShell pageTitle="Payments">
      <div className="space-y-8">
        <PageHeader
          eyebrow="Billing"
          title="Payments"
          description="Track payment activity, outstanding balances, and payment history across your projects."
        />

        {allInvoices.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No invoices yet"
            description="Payments are recorded against invoices. Create a project and an invoice first, then record payments here."
          />
        ) : (
          <>
            {/* Payment overview */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[var(--radius-lg)] border border-line bg-paper p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
                      Invoices
                    </p>

                    <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                      {allInvoices.length}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-soft text-slate">
                    <Receipt className="h-4.5 w-4.5" />
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate">
                  With payment records
                </p>
              </div>

              <div className="rounded-[var(--radius-lg)] border border-line bg-paper p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
                      Invoice Value
                    </p>

                    <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                      {formatCurrency(totalInvoiced)}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-soft text-slate">
                    <CircleDollarSign className="h-4.5 w-4.5" />
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate">
                  Total billed across invoices
                </p>
              </div>

              <div className="rounded-[var(--radius-lg)] border border-line bg-paper p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
                      Paid
                    </p>

                    <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                      {paidInvoices}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-soft text-slate">
                    <FileText className="h-4.5 w-4.5" />
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate">
                  Fully settled invoices
                </p>
              </div>

              <div className="rounded-[var(--radius-lg)] border border-line bg-paper p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
                      Outstanding
                    </p>

                    <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                      {outstandingInvoices}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-soft text-slate">
                    <Clock3 className="h-4.5 w-4.5" />
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate">
                  Still awaiting full payment
                </p>
              </div>
            </div>

            {/* Payment sections */}
            <div className="space-y-6">
              {projectsWithInvoices.map(({ project, invoices }) => {
                if (invoices.length === 0) {
                  return null;
                }

                return (
                  <section key={project.id} className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <Link
                        href={`/projects/${project.id}`}
                        className="group min-w-0"
                      >
                        <div className="flex items-center gap-2">
                          <H3 className="truncate transition-colors group-hover:text-signal">
                            {project.title}
                          </H3>

                          <span className="shrink-0 rounded-full border border-line bg-paper px-2 py-0.5 text-[11px] font-medium text-muted">
                            {invoices.length}{" "}
                            {invoices.length === 1 ? "invoice" : "invoices"}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-slate">
                          View project details
                        </p>
                      </Link>

                      <Mono className="hidden shrink-0 text-xs text-muted sm:block">
                        {formatCurrency(
                          invoices.reduce(
                            (sum, invoice) => sum + invoice.amount,
                            0
                          )
                        )}
                      </Mono>
                    </div>

                    <div className="space-y-4">
                      {invoices.map((invoice) => (
                        <div
                          key={invoice.id}
                          className="rounded-[var(--radius-lg)] border border-line bg-paper p-4 sm:p-5"
                        >
                          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <Mono className="text-sm font-medium text-ink">
                                {invoice.invoice_number}
                              </Mono>

                              <p className="mt-1 text-xs text-slate">
                                Payment history and outstanding balance
                              </p>
                            </div>
                          </div>

                          <PaymentsCardStandalone invoice={invoice} />
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}