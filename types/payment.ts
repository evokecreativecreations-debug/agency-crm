/**
 * Mirrors the "payments" table — see CRM_Blueprint_v2.md, Section 3.
 * Note: the frozen schema uses "paid_at" (not "payment_date") and has no
 * "reference" column.
 */

export type PaymentMethod =
  | "bank_transfer"
  | "cash"
  | "stripe"
  | "paypal"
  | "other";

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: PaymentMethod;
  paid_at: string;
  notes: string | null;
  created_at: string;
}

/** Fields required to record a payment against an invoice. */
export interface NewPaymentInput {
  invoice_id: string;
  amount: number;
  payment_method: PaymentMethod;
  paid_at: string;
  notes?: string;
}

/** Fields that can be changed after a payment is recorded. */
export type UpdatePaymentInput = Partial<
  Pick<Payment, "amount" | "payment_method" | "paid_at" | "notes">
>;