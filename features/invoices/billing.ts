import type { BillingFields, BillingItem } from "@/types/billing";
export const money = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    amount,
  );
const cents = (n: number) => Math.round((n + Number.EPSILON) * 100);
const twoDecimals = (n: number) =>
  Number.isFinite(n) && Math.abs(n * 100 - Math.round(n * 100)) < 0.00001;
export function billingTotals(items: BillingItem[], discount = 0, taxRate = 0) {
  const subtotalCents = items.reduce(
    (sum, i) =>
      sum + Math.round((cents(i.quantity) * cents(i.unit_price)) / 100),
    0,
  );
  const discountedCents = subtotalCents - cents(discount);
  const taxCents = Math.round((discountedCents * cents(taxRate)) / 10000);
  return {
    subtotal: subtotalCents / 100,
    tax: taxCents / 100,
    total: (discountedCents + taxCents) / 100,
  };
}
export function validateBilling(fields: BillingFields) {
  if (fields.line_items.length < 1 || fields.line_items.length > 100)
    throw new Error("Add between 1 and 100 line items.");
  for (const i of fields.line_items) {
    if (
      !i.description.trim() ||
      i.description.length > 1000 ||
      !twoDecimals(i.quantity) ||
      i.quantity <= 0 ||
      i.quantity > 1000000 ||
      !twoDecimals(i.unit_price) ||
      i.unit_price < 0 ||
      i.unit_price > 1000000000
    )
      throw new Error(
        "Each item needs a description, positive quantity and valid price (up to two decimal places).",
      );
  }
  const { subtotal, total } = billingTotals(
    fields.line_items,
    fields.discount_amount,
    fields.tax_rate,
  );
  if (
    ![fields.discount_amount, fields.tax_rate, fields.deposit_amount].every(
      twoDecimals,
    ) ||
    fields.discount_amount < 0 ||
    fields.discount_amount > subtotal ||
    fields.tax_rate < 0 ||
    fields.tax_rate > 100 ||
    fields.deposit_amount < 0 ||
    fields.deposit_amount > total ||
    total <= 0 ||
    total > 9999999999.99
  )
    throw new Error(
      "Check the discount, tax and requested advance. Total must be positive and advance cannot exceed it.",
    );
  if (fields.notes.length > 10000 || fields.payment_terms.length > 5000)
    throw new Error("Notes or terms are too long.");
  return total;
}
export const emptyBilling = (): BillingFields => ({
  line_items: [{ description: "", quantity: 1, unit_price: 0 }],
  discount_amount: 0,
  tax_rate: 0,
  deposit_amount: 0,
  notes: "",
  payment_terms: "",
});
