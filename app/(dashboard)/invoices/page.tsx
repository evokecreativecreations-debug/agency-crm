import { DashboardShell } from "@/components/layout/DashboardShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { H3, Mono } from "@/components/ui/Typography";
import { InvoicesCard } from "@/features/invoices/components/InvoicesCard";
import { getInvoices } from "@/features/invoices/api";
import { getProjects } from "@/features/projects/api";
import { createClient } from "@/lib/supabase/server";
import {
  CircleDollarSign,
  FileText,
  FolderKanban,
  Receipt,
} from "lucide-react";
import Link from "next/link";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default async function InvoicesPage() {
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
    <DashboardShell pageTitle="Invoices">
      <div className="space-y-8">
        <PageHeader
          eyebrow="Billing"
          title="Invoices"
          description="Manage invoices, track billing status, and review payment activity across your projects."
        />

        {projects.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No projects yet"
            description="Invoices are created from inside a project. Create a project first, then add invoices to it."
          />
        ) : (
          <>
            {/* Billing overview */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[var(--radius-lg)] border border-line bg-paper p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
                      Total Invoices
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
                  Across all projects
                </p>
              </div>

              <div className="rounded-[var(--radius-lg)] border border-line bg-paper p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
                      Total Invoiced
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
                  Gross invoice value
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
                  Fully paid invoices
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
                    <FolderKanban className="h-4.5 w-4.5" />
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate">
                  Awaiting full payment
                </p>
              </div>
            </div>

            {/* Invoice sections */}
            <div className="space-y-6">
              {projectsWithInvoices.map(({ project, invoices }) => (
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

                    {invoices.length > 0 && (
                      <Mono className="hidden shrink-0 text-xs text-muted sm:block">
                        {formatCurrency(
                          invoices.reduce(
                            (sum, invoice) => sum + invoice.amount,
                            0
                          )
                        )}
                      </Mono>
                    )}
                  </div>

                  <InvoicesCard
                    projectId={project.id}
                    initialInvoices={invoices}
                  />
                </section>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}