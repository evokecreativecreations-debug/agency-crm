"use client";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { createInvoice, updateInvoice } from "@/features/invoices/api";
import { createClient } from "@/lib/supabase/client";
import type { Invoice } from "@/types/invoice";
import { CalendarDays, FileText } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

interface InvoiceFormDialogProps {
  open: boolean;
  projectId: string;
  invoice?: Invoice | null;
  onClose: () => void;
  onSaved: (invoice: Invoice) => void;
}

function toDateInputValue(value: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

export function InvoiceFormDialog({
  open,
  projectId,
  invoice = null,
  onClose,
  onSaved,
}: InvoiceFormDialogProps) {
  const editing = invoice !== null;

  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setAmount(invoice ? String(invoice.amount) : "");
    setDueDate(invoice ? toDateInputValue(invoice.due_date) : "");
    setError(null);
  }, [open, invoice]);

  function handleClose() {
    if (saving) return;
    setError(null);
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const numericAmount = Number(amount);

    if (!amount.trim() || !Number.isFinite(numericAmount)) {
      setError("Please enter a valid invoice amount.");
      return;
    }

    if (numericAmount <= 0) {
      setError("Invoice amount must be greater than zero.");
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();

      if (editing && invoice) {
        await updateInvoice(supabase, invoice.id, {
          amount: numericAmount,
          due_date: dueDate || null,
        });

        const updatedInvoice: Invoice = {
          ...invoice,
          amount: numericAmount,
          due_date: dueDate || null,
        };

        onSaved(updatedInvoice);
      } else {
       const createdInvoice = await createInvoice(supabase, {
  project_id: projectId,
  amount: numericAmount,
  due_date: dueDate || undefined,
});

        onSaved(createdInvoice);
      }

      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving the invoice."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={editing ? "Edit invoice" : "Create invoice"}
      description={
        editing
          ? "Update the invoice amount or payment due date."
          : "Create a new invoice for this project."
      }
      size="md"
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="invoice-form"
            loading={saving}
          >
            {editing ? "Save Changes" : "Create Invoice"}
          </Button>
        </div>
      }
    >
      <form
        id="invoice-form"
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {/* Invoice identity */}
        <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-line bg-soft/40 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-paper">
            <FileText className="h-4 w-4 text-muted" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">
              {editing
                ? invoice?.invoice_number
                : "New invoice"}
            </p>

            <p className="mt-0.5 text-xs leading-5 text-slate">
              {editing
                ? "Keep the invoice details accurate for billing and payment tracking."
                : "Set the amount and due date. The invoice number will be generated automatically."}
            </p>
          </div>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <label
            htmlFor="invoice-amount"
            className="block text-sm font-medium text-ink"
          >
            Invoice amount
          </label>

          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
              $
            </span>

            <Input
              id="invoice-amount"
              name="amount"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="pl-7"
              autoFocus
              disabled={saving}
              required
            />
          </div>

          <p className="text-xs leading-5 text-muted">
            Enter the total amount that should be billed to the client.
          </p>
        </div>

        {/* Due date */}
        <div className="space-y-2">
          <label
            htmlFor="invoice-due-date"
            className="block text-sm font-medium text-ink"
          >
            Payment due date
          </label>

          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

            <Input
              id="invoice-due-date"
              name="due_date"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="pl-10"
              disabled={saving}
            />
          </div>

          <p className="text-xs leading-5 text-muted">
            Optional. This date is used to track when payment is expected.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-danger/30 bg-danger/5 px-3.5 py-3 text-sm text-danger"
          >
            {error}
          </div>
        )}
      </form>
    </Dialog>
  );
}