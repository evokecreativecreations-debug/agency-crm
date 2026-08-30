"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { Select } from "@/components/ui/Select";
import { Caption, Mono } from "@/components/ui/Typography";
import { InvoiceFormDialog } from "@/features/invoices/components/InvoiceFormDialog";
import {
  INVOICE_STATUS_LABEL,
  InvoiceStatusBadge,
} from "@/features/invoices/components/InvoiceStatusBadge";
import { updateInvoiceStatus } from "@/features/invoices/api";
import { PaymentsCard } from "@/features/payments/components/PaymentsCard";
import { createClient } from "@/lib/supabase/client";
import type { Invoice, InvoiceStatus } from "@/types/invoice";
import {
  CalendarDays,
  ChevronRight,
  Pencil,
  Plus,
  Receipt,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface InvoicesCardProps {
  projectId: string;
  initialInvoices: Invoice[];
}

const ALL_STATUSES: InvoiceStatus[] = [
  "draft",
  "sent",
  "partially_paid",
  "paid",
  "overdue",
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(iso: string | null) {
  if (!iso) return null;

  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function InvoicesCard({
  projectId,
  initialInvoices,
}: InvoicesCardProps) {
  const router = useRouter();

  const [invoices, setInvoices] = useState(initialInvoices);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [managingPaymentsFor, setManagingPaymentsFor] =
    useState<Invoice | null>(null);

  function handleCreated(invoice: Invoice) {
    setInvoices((prev) => [invoice, ...prev]);
    setDialogOpen(false);
    router.refresh();
  }

  function handleEdited(invoice: Invoice) {
    setInvoices((prev) =>
      prev.map((item) => (item.id === invoice.id ? invoice : item))
    );

    setEditingInvoice(null);
    router.refresh();
  }

  async function handleStatusChange(
    id: string,
    status: InvoiceStatus
  ) {
    const previousInvoices = invoices;

    setUpdatingId(id);

    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.id === id ? { ...invoice, status } : invoice
      )
    );

    try {
      const supabase = createClient();

      await updateInvoiceStatus(supabase, id, status);
    } catch {
      setInvoices(previousInvoices);
    } finally {
      setUpdatingId(null);
      router.refresh();
    }
  }

  function handleInvoiceChangedByPayment(invoice: Invoice) {
    setInvoices((prev) =>
      prev.map((item) => (item.id === invoice.id ? invoice : item))
    );

    setManagingPaymentsFor(invoice);
    router.refresh();
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-line bg-paper">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <CardTitle>Invoices</CardTitle>

              <Caption className="mt-1 block">
                {invoices.length === 0
                  ? "No invoices created yet"
                  : `${invoices.length} ${
                      invoices.length === 1 ? "invoice" : "invoices"
                    }`}
              </Caption>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              New Invoice
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-paper">
                <Receipt className="h-5 w-5 text-muted" />
              </div>

              <p className="text-sm font-medium text-ink">
                No invoices yet
              </p>

              <p className="mt-1 max-w-sm text-xs leading-5 text-slate">
                Create your first invoice to start tracking billing and
                payments for this project.
              </p>

              <Button
                className="mt-4"
                size="sm"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Create Invoice
              </Button>
            </div>
          ) : (
            <div>
              {/* Desktop table header */}
              <div className="hidden border-b border-line bg-soft/40 px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted md:grid md:grid-cols-[minmax(180px,1fr)_150px_150px_190px] md:items-center md:gap-4">
                <span>Invoice</span>
                <span>Amount</span>
                <span>Status</span>
                <span className="text-right">Actions</span>
              </div>

              <div className="divide-y divide-line">
                {invoices.map((invoice) => {
                  const dueDate = formatDate(invoice.due_date);

                  return (
                    <div
                      key={invoice.id}
                      className="group px-4 py-4 transition-colors hover:bg-soft/30 sm:px-5"
                    >
                      {/* Desktop */}
                      <div className="hidden md:grid md:grid-cols-[minmax(180px,1fr)_150px_150px_190px] md:items-center md:gap-4">
                        <button
                          type="button"
                          onClick={() => setEditingInvoice(invoice)}
                          className="min-w-0 text-left"
                        >
                          <div className="flex items-center gap-2">
                            <Mono className="font-medium text-ink">
                              {invoice.invoice_number}
                            </Mono>

                            <Pencil
                              className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100"
                              aria-hidden="true"
                            />
                          </div>

                          {dueDate ? (
                            <span className="mt-1 flex items-center gap-1.5 text-xs text-slate">
                              <CalendarDays className="h-3 w-3" />
                              Due {dueDate}
                            </span>
                          ) : (
                            <span className="mt-1 block text-xs text-muted">
                              No due date
                            </span>
                          )}
                        </button>

                        <Mono className="font-medium text-ink">
                          {formatCurrency(invoice.amount)}
                        </Mono>

                        <div>
                          <InvoiceStatusBadge status={invoice.status} />
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          <Select
                            aria-label={`Status for ${invoice.invoice_number}`}
                            value={invoice.status}
                            disabled={updatingId === invoice.id}
                            onChange={(event) =>
                              handleStatusChange(
                                invoice.id,
                                event.target.value as InvoiceStatus
                              )
                            }
                            className="h-8 w-36 text-xs"
                          >
                            {ALL_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {INVOICE_STATUS_LABEL[status]}
                              </option>
                            ))}
                          </Select>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setManagingPaymentsFor(invoice)
                            }
                          >
                            <Receipt className="h-3.5 w-3.5" />
                            Payments
                          </Button>
                        </div>
                      </div>

                      {/* Mobile */}
                      <div className="space-y-3 md:hidden">
                        <div className="flex items-start justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => setEditingInvoice(invoice)}
                            className="min-w-0 text-left"
                          >
                            <div className="flex items-center gap-2">
                              <Mono className="font-medium text-ink">
                                {invoice.invoice_number}
                              </Mono>

                              <Pencil
                                className="h-3 w-3 text-muted"
                                aria-hidden="true"
                              />
                            </div>

                            {dueDate ? (
                              <span className="mt-1 flex items-center gap-1.5 text-xs text-slate">
                                <CalendarDays className="h-3 w-3" />
                                Due {dueDate}
                              </span>
                            ) : (
                              <span className="mt-1 block text-xs text-muted">
                                No due date
                              </span>
                            )}
                          </button>

                          <Mono className="shrink-0 font-medium text-ink">
                            {formatCurrency(invoice.amount)}
                          </Mono>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <InvoiceStatusBadge status={invoice.status} />

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setManagingPaymentsFor(invoice)
                            }
                          >
                            <Receipt className="h-3.5 w-3.5" />
                            Payments
                            <ChevronRight className="h-3 w-3 text-muted" />
                          </Button>
                        </div>

                        <Select
                          aria-label={`Status for ${invoice.invoice_number}`}
                          value={invoice.status}
                          disabled={updatingId === invoice.id}
                          onChange={(event) =>
                            handleStatusChange(
                              invoice.id,
                              event.target.value as InvoiceStatus
                            )
                          }
                          className="h-9 w-full text-xs"
                        >
                          {ALL_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {INVOICE_STATUS_LABEL[status]}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <InvoiceFormDialog
        open={dialogOpen}
        projectId={projectId}
        onClose={() => setDialogOpen(false)}
        onSaved={handleCreated}
      />

      <InvoiceFormDialog
        key={editingInvoice?.id ?? "none"}
        open={editingInvoice !== null}
        projectId={projectId}
        invoice={editingInvoice}
        onClose={() => setEditingInvoice(null)}
        onSaved={handleEdited}
      />

      <Dialog
        open={managingPaymentsFor !== null}
        onClose={() => setManagingPaymentsFor(null)}
        title={
          managingPaymentsFor
            ? `Payments — ${managingPaymentsFor.invoice_number}`
            : "Payments"
        }
        description="Record and review payments against this invoice."
        size="lg"
      >
        {managingPaymentsFor && (
          <PaymentsCard
            key={managingPaymentsFor.id}
            invoice={managingPaymentsFor}
            onInvoiceChange={handleInvoiceChangedByPayment}
          />
        )}
      </Dialog>
    </>
  );
}