"use client";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Spinner } from "@/components/ui/Spinner";
import { Caption, Eyebrow, Mono } from "@/components/ui/Typography";
import { getInvoiceById } from "@/features/invoices/api";
import { deletePayment, getPayments } from "@/features/payments/api";
import { PaymentFormDialog } from "@/features/payments/components/PaymentFormDialog";
import { PaymentHistoryTable } from "@/features/payments/components/PaymentHistoryTable";
import { createClient } from "@/lib/supabase/client";
import type { Invoice } from "@/types/invoice";
import type { Payment } from "@/types/payment";
import { AlertCircle, CheckCircle2, Clock3, Plus, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface PaymentsCardProps {
  invoice: Invoice;
  onInvoiceChange: (invoice: Invoice) => void;
}

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

function getProgressPercentage(totalPaid: number, invoiceAmount: number) {
  if (invoiceAmount <= 0) return 0;

  return Math.min(Math.max((totalPaid / invoiceAmount) * 100, 0), 100);
}

export function PaymentsCard({
  invoice: initialInvoice,
  onInvoiceChange,
}: PaymentsCardProps) {
  const [invoice, setInvoice] = useState(initialInvoice);
  const [payments, setPayments] = useState<Payment[] | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<Payment | null>(null);

  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPayments() {
      setPayments(null);
      setLoadError(null);

      try {
        const supabase = createClient();
        const data = await getPayments(supabase, initialInvoice.id);

        if (!cancelled) {
          setPayments(data);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Failed to load payments."
          );
        }
      }
    }

    void loadPayments();

    return () => {
      cancelled = true;
    };
  }, [initialInvoice.id]);

  const totalPaid = useMemo(
    () => (payments ?? []).reduce((sum, payment) => sum + payment.amount, 0),
    [payments]
  );

  const remainingBalance = Math.max(invoice.amount - totalPaid, 0);

  const progressPercentage = getProgressPercentage(
    totalPaid,
    invoice.amount
  );

  const isPaid = remainingBalance <= 0 && invoice.amount > 0;

  async function refreshAfterChange() {
    setRefreshing(true);
    setLoadError(null);

    try {
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
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Failed to refresh payment information."
      );
    } finally {
      setRefreshing(false);
    }
  }

  async function handleSaved() {
    setDialogOpen(false);
    setEditingPayment(null);
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
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Failed to delete payment."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Invoice summary */}
      <div className="rounded-[var(--radius-lg)] border border-line bg-paper">
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <WalletCards
                className="h-4 w-4 shrink-0 text-signal"
                aria-hidden="true"
              />

              <Eyebrow>Invoice</Eyebrow>
            </div>

            <Mono className="mt-1 block truncate text-base font-medium">
              {invoice.invoice_number}
            </Mono>
          </div>

          <div className="shrink-0 text-right">
            <Caption>Invoice total</Caption>
            <Mono className="mt-1 block text-base font-medium">
              {formatCurrency(invoice.amount)}
            </Mono>
          </div>
        </div>

        <div className="grid grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="px-5 py-4">
            <Eyebrow>Total paid</Eyebrow>

            <Mono className="mt-1 block text-lg font-semibold">
              {formatCurrency(totalPaid)}
            </Mono>

            <Caption className="mt-1 block">
              {payments?.length ?? 0}{" "}
              {(payments?.length ?? 0) === 1 ? "payment" : "payments"}
            </Caption>
          </div>

          <div className="px-5 py-4">
            <Eyebrow>Remaining</Eyebrow>

            <Mono
              className={`mt-1 block text-lg font-semibold ${
                isPaid ? "text-signal" : ""
              }`}
            >
              {formatCurrency(remainingBalance)}
            </Mono>

            <Caption className="mt-1 block">
              {isPaid ? "Fully paid" : "Outstanding balance"}
            </Caption>
          </div>

          <div className="px-5 py-4">
            <Eyebrow>Due date</Eyebrow>

            <Mono className="mt-1 block text-base font-medium">
              {formatDate(invoice.due_date) ?? "No due date"}
            </Mono>

            <Caption className="mt-1 block">
              {invoice.due_date ? "Payment deadline" : "No deadline set"}
            </Caption>
          </div>
        </div>

        {/* Payment progress */}
        <div className="border-t border-line px-5 py-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <Caption>Payment progress</Caption>

            <Mono className="text-xs font-medium">
              {Math.round(progressPercentage)}%
            </Mono>
          </div>

          <div
            className="h-2 overflow-hidden rounded-full bg-slate/10"
            aria-label={`Payment progress: ${Math.round(
              progressPercentage
            )}%`}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progressPercentage)}
          >
            <div
              className={`h-full rounded-full transition-all ${
                isPaid ? "bg-signal" : "bg-ink"
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Status notice */}
      {isPaid ? (
        <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-signal/20 bg-signal/5 px-4 py-3">
          <CheckCircle2
            className="mt-0.5 h-4 w-4 shrink-0 text-signal"
            aria-hidden="true"
          />

          <div>
            <p className="text-sm font-medium">Invoice fully paid</p>
            <p className="mt-0.5 text-xs text-slate">
              This invoice has received the full amount of{" "}
              {formatCurrency(invoice.amount)}.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-line bg-paper px-4 py-3">
          <Clock3
            className="mt-0.5 h-4 w-4 shrink-0 text-slate"
            aria-hidden="true"
          />

          <div className="min-w-0">
            <p className="text-sm font-medium">Outstanding balance</p>
            <p className="mt-0.5 text-xs text-slate">
              {formatCurrency(remainingBalance)} remains to be collected.
            </p>
          </div>
        </div>
      )}

      {/* Payment history */}
      <div className="rounded-[var(--radius-lg)] border border-line bg-paper">
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <p className="text-sm font-medium">Payment history</p>
            <Caption className="mt-0.5 block">
              All payments recorded against this invoice.
            </Caption>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setDialogOpen(true)}
            disabled={remainingBalance <= 0 || refreshing}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Payment
          </Button>
        </div>

        <div className="p-5">
          {refreshing && payments !== null ? (
            <div className="mb-4 flex items-center gap-2 text-xs text-slate">
              <Spinner label="Refreshing payment information" />
              <span>Updating payment information…</span>
            </div>
          ) : null}

          {loadError ? (
            <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-danger/20 bg-danger/5 px-4 py-3">
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0 text-danger"
                aria-hidden="true"
              />

              <div>
                <p className="text-sm font-medium text-danger">
                  Unable to load payment information
                </p>

                <p className="mt-0.5 text-xs text-danger/80">
                  {loadError}
                </p>
              </div>
            </div>
          ) : payments === null ? (
            <div className="flex justify-center py-10">
              <Spinner label="Loading payments" />
            </div>
          ) : payments.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-line px-5 py-10 text-center">
              <WalletCards
                className="mx-auto h-7 w-7 text-muted"
                aria-hidden="true"
              />

              <p className="mt-3 text-sm font-medium">
                No payments recorded yet
              </p>

              <p className="mx-auto mt-1 max-w-sm text-xs text-slate">
                Record the first payment to start tracking this invoice's
                collection progress.
              </p>

              <Button
                size="sm"
                variant="outline"
                className="mt-4"
                onClick={() => setDialogOpen(true)}
                disabled={remainingBalance <= 0}
              >
                <Plus className="h-3.5 w-3.5" />
                Record Payment
              </Button>
            </div>
          ) : (
            <PaymentHistoryTable
              payments={payments}
              onEdit={(payment) => setEditingPayment(payment)}
              onDelete={(payment) => setConfirmingDelete(payment)}
            />
          )}
        </div>
      </div>

      {/* Add payment */}
      <PaymentFormDialog
        open={dialogOpen}
        invoiceId={invoice.id}
        maxAmount={remainingBalance}
        onClose={() => setDialogOpen(false)}
        onSaved={handleSaved}
      />

      {/* Edit payment */}
      <PaymentFormDialog
        key={editingPayment?.id ?? "none"}
        open={editingPayment !== null}
        invoiceId={invoice.id}
        payment={editingPayment}
        maxAmount={remainingBalance + (editingPayment?.amount ?? 0)}
        onClose={() => setEditingPayment(null)}
        onSaved={handleSaved}
      />

      {/* Delete confirmation */}
      <Dialog
        open={confirmingDelete !== null}
        onClose={() => {
          if (!deleting) {
            setConfirmingDelete(null);
          }
        }}
        title="Delete this payment?"
        description={
          confirmingDelete
            ? `This will remove the ${formatCurrency(
                confirmingDelete.amount
              )} payment and update the invoice balance. This action can't be undone.`
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

            <Button
              variant="destructive"
              loading={deleting}
              onClick={handleConfirmDelete}
            >
              Delete Payment
            </Button>
          </>
        }
      />
    </div>
  );
}