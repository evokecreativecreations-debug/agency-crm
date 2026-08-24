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
import { Pencil, Plus, Receipt } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface InvoicesCardProps {
  projectId: string;
  initialInvoices: Invoice[];
}

const ALL_STATUSES: InvoiceStatus[] = ["draft", "sent", "partially_paid", "paid", "overdue"];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(amount);
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * InvoicesCard — the "Invoices" section on a Project's detail page
 * (Phase 9: list, create, and change status of invoices, all scoped to
 * this project). Same isolated-interactivity approach as
 * ProjectTasksCard/ProjectRevisionsCard — the one client component
 * embedded into the otherwise server-rendered ProjectDetailView.
 *
 * Phase 10 adds a "Payments" action per row, opening PaymentsCard inside
 * a wider Dialog (size="lg").
 */
export function InvoicesCard({ projectId, initialInvoices }: InvoicesCardProps) {
  const router = useRouter();
  const [invoices, setInvoices] = useState(initialInvoices);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [managingPaymentsFor, setManagingPaymentsFor] = useState<Invoice | null>(null);

  function handleCreated(invoice: Invoice) {
    setInvoices((prev) => [invoice, ...prev]);
    router.refresh();
  }

  function handleEdited(invoice: Invoice) {
    setInvoices((prev) => prev.map((i) => (i.id === invoice.id ? invoice : i)));
    router.refresh();
  }

  async function handleStatusChange(id: string, status: InvoiceStatus) {
    setUpdatingId(id);
    // Optimistic update so the dropdown feels instant.
    setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    try {
      const supabase = createClient();
      await updateInvoiceStatus(supabase, id, status);
    } finally {
      setUpdatingId(null);
      router.refresh();
    }
  }

  function handleInvoiceChangedByPayment(invoice: Invoice) {
    setInvoices((prev) => prev.map((i) => (i.id === invoice.id ? invoice : i)));
    setManagingPaymentsFor(invoice);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
        <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> New Invoice
        </Button>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <p className="text-sm text-slate">No invoices for this project yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {invoices.map((invoice) => {
              const dueDate = formatDate(invoice.due_date);
              return (
                <li key={invoice.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <button
                      onClick={() => setEditingInvoice(invoice)}
                      className="flex items-center gap-1.5 text-left"
                    >
                      <Mono className="font-medium">{invoice.invoice_number}</Mono>
                      <Pencil className="h-3 w-3 shrink-0 text-muted" aria-hidden="true" />
                    </button>
                    <div className="flex items-center gap-2">
                      <Mono>{formatCurrency(invoice.amount)}</Mono>
                      {dueDate && <Caption>Due {dueDate}</Caption>}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <InvoiceStatusBadge status={invoice.status} />
                    <Select
                      aria-label={`Status for ${invoice.invoice_number}`}
                      value={invoice.status}
                      disabled={updatingId === invoice.id}
                      onChange={(e) =>
                        handleStatusChange(invoice.id, e.target.value as InvoiceStatus)
                      }
                      className="h-8 w-40 text-xs"
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
                      onClick={() => setManagingPaymentsFor(invoice)}
                    >
                      <Receipt className="h-3.5 w-3.5" /> Payments
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>

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
        title={managingPaymentsFor ? `Payments — ${managingPaymentsFor.invoice_number}` : "Payments"}
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
    </Card>
  );
}