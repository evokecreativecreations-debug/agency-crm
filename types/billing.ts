export interface BillingItem {
  description: string;
  quantity: number;
  unit_price: number;
}
export interface BillingFields {
  line_items: BillingItem[];
  discount_amount: number;
  tax_rate: number;
  deposit_amount: number;
  notes: string;
  payment_terms: string;
}
export type QuotationStatus =
  "draft" | "sent" | "accepted" | "declined" | "expired";
export interface Quotation extends BillingFields {
  id: string;
  quotation_number: string;
  lead_id: string | null;
  client_id: string | null;
  recipient_name: string;
  recipient_email: string;
  amount: number;
  valid_until: string | null;
  status: QuotationStatus;
  invoice_id: string | null;
  created_at: string;
}
