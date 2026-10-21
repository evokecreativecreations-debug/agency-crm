import type { BillingFields } from "./billing";
/**
 * Mirrors the "invoices" table — see CRM_Blueprint_v2.md, Section 3, and
 * supabase/migrations/20260817090000_create_invoices_table.sql.
 * Note: the frozen schema has no "issued_date" or "notes" column, and
 * status includes "partially_paid" alongside draft/sent/paid/overdue.
 */

export type InvoiceStatus =
  "draft" | "sent" | "partially_paid" | "paid" | "overdue";

export interface Invoice {
  id: string;
  project_id: string;
  invoice_number: string;
  amount: number;
  status: InvoiceStatus;
  due_date: string | null;
  created_at: string;
  line_items?: BillingFields["line_items"];
  discount_amount?: number;
  tax_rate?: number;
  deposit_amount?: number;
  notes?: string;
  payment_terms?: string;
  recipient_name?: string | null;
  recipient_email?: string | null;
}

/** Fields required to create an invoice. invoice_number is generated
 * automatically by createInvoice (next sequential INV-XXXX) — not
 * supplied by the caller. status always starts as "draft". */
export interface NewInvoiceInput extends BillingFields {
  project_id: string;
  amount: number;
  due_date?: string;
}

/** Fields that can be changed after an invoice is created. */
export type UpdateInvoiceInput = Partial<
  Pick<Invoice, "amount" | "due_date" | "status"> & BillingFields
>;
