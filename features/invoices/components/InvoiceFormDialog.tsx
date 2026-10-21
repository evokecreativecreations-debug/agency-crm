"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { BillingEditor } from "./BillingEditor";
import { billingTotals, emptyBilling, validateBilling } from "../billing";
import { createInvoice, updateInvoice } from "../api";
import { createClient } from "@/lib/supabase/client";
import type { Invoice } from "@/types/invoice";
import type { BillingFields } from "@/types/billing";
interface Props {
  open: boolean;
  projectId: string;
  invoice?: Invoice | null;
  onClose: () => void;
  onSaved: (invoice: Invoice) => void;
}
export function InvoiceFormDialog(props: Props) {
  return props.open ? (
    <InvoiceForm key={props.invoice?.id ?? "new"} {...props} />
  ) : null;
}
function InvoiceForm({ open, projectId, invoice, onClose, onSaved }: Props) {
  const router = useRouter();
  const [fields, setFields] = useState<BillingFields>(() => ({
    ...emptyBilling(),
    ...invoice,
    line_items: invoice?.line_items?.length
      ? invoice.line_items
      : invoice
        ? [
            {
              description: "Project services",
              quantity: 1,
              unit_price: Number(invoice.amount),
            },
          ]
        : emptyBilling().line_items,
  }));
  const [due, setDue] = useState(invoice?.due_date?.slice(0, 10) ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const amount = validateBilling(fields);
      setSaving(true);
      const db = createClient();
      const payload = {
        line_items: fields.line_items,
        discount_amount: fields.discount_amount,
        tax_rate: fields.tax_rate,
        deposit_amount: fields.deposit_amount,
        notes: fields.notes,
        payment_terms: fields.payment_terms,
        amount,
        due_date: due || null,
      };
      if (invoice) {
        await updateInvoice(db, invoice.id, payload);
        onSaved({ ...invoice, ...payload });
      } else
        onSaved(
          await createInvoice(db, {
            ...fields,
            project_id: projectId,
            amount: billingTotals(
              fields.line_items,
              fields.discount_amount,
              fields.tax_rate,
            ).total,
            due_date: due || undefined,
          }),
        );
      onClose();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save invoice.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!saving) onClose();
      }}
      title={invoice ? `Edit ${invoice.invoice_number}` : "Create invoice"}
      description="Itemised billing with an automatic document number."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="invoice-form" loading={saving}>
            {invoice ? "Save invoice" : "Create invoice"}
          </Button>
        </>
      }
    >
      <form id="invoice-form" onSubmit={submit} className="space-y-5">
        <BillingEditor value={fields} onChange={setFields} disabled={saving} />
        <Input
          label="Payment due date"
          type="date"
          value={due}
          onChange={(e) => setDue(e.target.value)}
          disabled={saving}
        />
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
      </form>
    </Dialog>
  );
}
