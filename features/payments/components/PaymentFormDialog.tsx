"use client";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { createPayment, updatePayment } from "@/features/payments/api";
import { PAYMENT_METHOD_LABEL } from "@/features/payments/components/PaymentHistoryTable";
import { createClient } from "@/lib/supabase/client";
import type { Payment, PaymentMethod } from "@/types/payment";
import { useState, type FormEvent } from "react";

interface PaymentFormDialogProps {
  open: boolean;
  invoiceId: string;
  /** When provided, the dialog edits this payment instead of recording a new one. */
  payment?: Payment | null;
  /**
   * The most this payment can be, given the invoice's remaining balance.
   * When editing, this already has the payment's own current amount
   * added back in (so saving the same amount, or a smaller one, always
   * succeeds) — computed by the caller (PaymentsCard).
   */
  maxAmount: number;
  onClose: () => void;
  onSaved: (payment: Payment) => void;
}

const ALL_METHODS: PaymentMethod[] = ["bank_transfer", "cash", "stripe", "paypal", "other"];

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(amount);
}

/**
 * PaymentFormDialog — one reusable dialog for both recording a new
 * payment and editing an existing one (same approach as every other
 * form dialog in the app — TaskFormDialog, RevisionFormDialog,
 * InvoiceFormDialog). Validates amount > 0 and amount <= the invoice's
 * remaining balance client-side, in addition to the same checks already
 * enforced server-side in features/payments/api.ts.
 */
export function PaymentFormDialog({
  open,
  invoiceId,
  payment,
  maxAmount,
  onClose,
  onSaved,
}: PaymentFormDialogProps) {
  const isEditing = !!payment;

  // Lazy initializers from the payment prop, same pattern used since
  // Phase 4 — the parent remounts this with a fresh key per payment, so
  // no useEffect sync is needed.
  const [amount, setAmount] = useState(() => (payment ? String(payment.amount) : ""));
  const [paidAt, setPaidAt] = useState(() => payment?.paid_at ?? todayISODate());
  const [method, setMethod] = useState<PaymentMethod>(
    () => payment?.payment_method ?? "bank_transfer"
  );
  const [notes, setNotes] = useState(() => payment?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleClose() {
    setError(null);
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Amount must be a number greater than 0.");
      return;
    }
    if (parsedAmount > maxAmount) {
      setError(`Amount cannot exceed the remaining balance of ${formatCurrency(maxAmount)}.`);
      return;
    }
    if (!paidAt) {
      setError("Payment date is required.");
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();

      if (isEditing && payment) {
        await updatePayment(supabase, payment.id, {
          amount: parsedAmount,
          payment_method: method,
          paid_at: paidAt,
          notes: notes || undefined,
        });
        setSaving(false);
        onSaved({
          ...payment,
          amount: parsedAmount,
          payment_method: method,
          paid_at: paidAt,
          notes: notes || null,
        });
      } else {
        const created = await createPayment(supabase, {
          invoice_id: invoiceId,
          amount: parsedAmount,
          payment_method: method,
          paid_at: paidAt,
          notes: notes || undefined,
        });
        setSaving(false);
        onSaved(created);
      }
      handleClose();
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={isEditing ? "Edit Payment" : "Add Payment"}
      description={
        isEditing
          ? "Update this payment's details."
          : `Record a payment against this invoice. Up to ${formatCurrency(maxAmount)} remaining.`
      }
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="payment-form" loading={saving}>
            {isEditing ? "Save Changes" : "Add Payment"}
          </Button>
        </>
      }
    >
      <form id="payment-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="500.00"
          error={error ?? undefined}
        />
        <Input
          label="Payment date"
          type="date"
          required
          value={paidAt}
          onChange={(e) => setPaidAt(e.target.value)}
        />
        <Select
          label="Payment method"
          required
          value={method}
          onChange={(e) => setMethod(e.target.value as PaymentMethod)}
        >
          {ALL_METHODS.map((m) => (
            <option key={m} value={m}>
              {PAYMENT_METHOD_LABEL[m]}
            </option>
          ))}
        </Select>
        <Textarea
          label="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Reference number, check number, anything worth noting..."
        />
      </form>
    </Dialog>
  );
}