"use client";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Spinner } from "@/components/ui/Spinner";
import { Caption, Eyebrow, Mono } from "@/components/ui/Typography";
import { deletePayment, getPayments } from "@/features/payments/api";
import { PaymentFormDialog } from "@/features/payments/components/PaymentFormDialog";
import { PaymentHistoryTable } from "@/features/payments/components/PaymentHistoryTable";
import { getInvoiceById } from "@/features/invoices/api";
import { createClient } from "@/lib/supabase/client";
import type { Invoice } from "@/types/invoice";
import type { Payment } from "@/types/payment";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface PaymentsCardProps {
  invoice: Invoice;
  /** Called whenever a payment change causes the invoice's status to
   * update, so the parent (InvoicesCard) can reflect it without a full
   * page reload. */
  onInvoiceChange: (invoice: Invoice) => void;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(amount);
}

/**
 * PaymentsCard — the payments view for a single invoice: totals summary
 * (Invoice Total / Total Paid / Remaining Balance), full payment history,
 * and add/edit/delete actions. Rendered inside a Dialog from
 * InvoicesCard rather than living on its own route — there's no
 * per-invoice detail page in this app, so this is opened as a modal.
 *
 * Fetches its own payment list lazily on mount (rather than the usual
 * server-preloaded pattern) since this content is only ever needed once
 * someone opens the Payments dialog for a specific invoice — preloading
 * payments for every invoice on every page load would be wasted work.
 */
export function PaymentsCard({ invoice: initialInvoice, onInvoiceChange }: PaymentsCardProps) {
  const [invoice, setInvoice] = useState(initialInvoice);
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<Payment | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    getPayments(supabase, initialInvoice.id)
      .then((data) => {
        if (!cancelled) setPayments(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Failed to load payments.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [initialInvoice.id]);

  const totalPaid = (payments ?? []).reduce((sum, p) => sum + p.amount, 0);
  const remainingBalance = Math.max(invoice.amount - totalPaid, 0);

  /** Re-fetches both the payment list and the invoice (its status may
   * have changed) after any create/update/delete, and notifies the parent. */
  async function refreshAfterChange() {
    const supabase = createClient();
    const [freshPayments, freshInvoice] = await Promise.all([
      getPayments(supabase, invoice.id),
      getInvoiceById(supabase, invoice.id),
    ]);
    setPayments(freshPayments);
    if (freshInvoice) {
      setInvoice(freshInvoice);
      onInvoiceChange(freshInvoice);
    }
  }

  async function handleSaved() {
    await refreshAfterChange();
  }

  async function handleConfirmDelete() {
    if (!confirmingDelete) return;
    setDeleting(true);
    try {
      const supabase = createClient();
      await deletePayment(supabase, confirmingDelete.id);
      setConfirmingDelete(null);
      await refreshAfterChange();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 rounded-[var(--radius-lg)] border border-line bg-paper p-4">
        <div>
          <Eyebrow>Invoice Total</Eyebrow>
          <Mono className="mt-1 block text-base">{formatCurrency(invoice.amount)}</Mono>
        </div>
        <div>
          <Eyebrow>Total Paid</Eyebrow>
          <Mono className="mt-1 block text-base">{formatCurrency(totalPaid)}</Mono>
        </div>
        <div>
          <Eyebrow>Remaining Balance</Eyebrow>
          <Mono className="mt-1 block text-base">{formatCurrency(remainingBalance)}</Mono>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Caption>Payment history</Caption>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setDialogOpen(true)}
          disabled={remainingBalance <= 0}
        >
          <Plus className="h-3.5 w-3.5" /> Add Payment
        </Button>
      </div>

      {payments === null ? (
        <div className="flex justify-center py-8">
          <Spinner label="Loading payments" />
        </div>
      ) : loadError ? (
        <p className="text-sm text-danger">{loadError}</p>
      ) : (
        <PaymentHistoryTable
          payments={payments}
          onEdit={(payment) => setEditingPayment(payment)}
          onDelete={(payment) => setConfirmingDelete(payment)}
        />
      )}

      <PaymentFormDialog
        open={dialogOpen}
        invoiceId={invoice.id}
        maxAmount={remainingBalance}
        onClose={() => setDialogOpen(false)}
        onSaved={handleSaved}
      />

      <PaymentFormDialog
        key={editingPayment?.id ?? "none"}
        open={editingPayment !== null}
        invoiceId={invoice.id}
        payment={editingPayment}
        maxAmount={remainingBalance + (editingPayment?.amount ?? 0)}
        onClose={() => setEditingPayment(null)}
        onSaved={handleSaved}
      />

      <Dialog
        open={confirmingDelete !== null}
        onClose={() => setConfirmingDelete(null)}
        title="Delete this payment?"
        description={
          confirmingDelete
            ? `This will remove the ${formatCurrency(confirmingDelete.amount)} payment and update the invoice's balance. This can't be undone.`
            : undefined
        }
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setConfirmingDelete(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" loading={deleting} onClick={handleConfirmDelete}>
              Delete Payment
            </Button>
          </>
        }
      />
    </div>
  );
}