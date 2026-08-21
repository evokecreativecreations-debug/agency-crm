"use client";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { createInvoice, updateInvoice } from "@/features/invoices/api";
import { createClient } from "@/lib/supabase/client";
import type { Invoice } from "@/types/invoice";
import { useState, type FormEvent } from "react";

interface InvoiceFormDialogProps {
  open: boolean;
  projectId: string;
  /** When provided, the dialog edits this invoice instead of creating a new one. */
  invoice?: Invoice | null;
  onClose: () => void;
  onSaved: (invoice: Invoice) => void;
}

/**
 * InvoiceFormDialog — one reusable dialog for both creating and editing
 * an invoice, rather than two separate components (same approach as
 * TaskFormDialog/RevisionFormDialog). Fields are limited to what the
 * frozen schema actually stores (amount, due date) — no issued_date or
 * notes column exists yet. Status isn't edited here — that stays as the
 * inline Select per row in InvoicesCard, same split used throughout the
 * app (list = interactive status, dialog = details).
 */
export function InvoiceFormDialog({
  open,
  projectId,
  invoice,
  onClose,
  onSaved,
}: InvoiceFormDialogProps) {
  const isEditing = !!invoice;

  // Lazy initializers from the invoice prop, same pattern used since
  // Phase 4 — the parent remounts this with a fresh key per invoice, so
  // no useEffect sync is needed.
  const [amount, setAmount] = useState(() => (invoice ? String(invoice.amount) : ""));
  const [dueDate, setDueDate] = useState(() => invoice?.due_date ?? "");
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

    setSaving(true);

    try {
      const supabase = createClient();

      if (isEditing && invoice) {
        await updateInvoice(supabase, invoice.id, {
          amount: parsedAmount,
          due_date: dueDate || undefined,
        });
        setSaving(false);
        onSaved({ ...invoice, amount: parsedAmount, due_date: dueDate || null });
      } else {
        const created = await createInvoice(supabase, {
          project_id: projectId,
          amount: parsedAmount,
          due_date: dueDate || undefined,
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
      title={isEditing ? `Edit ${invoice?.invoice_number}` : "New Invoice"}
      description={
        isEditing
          ? "Update this invoice's amount or due date."
          : "Create a new invoice for this project. It starts as Draft."
      }
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="invoice-form" loading={saving}>
            {isEditing ? "Save Changes" : "Create Invoice"}
          </Button>
        </>
      }
    >
      <form id="invoice-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="1500.00"
          error={error ?? undefined}
        />
        <Input
          label="Due date (optional)"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </form>
    </Dialog>
  );
}