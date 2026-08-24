import { getInvoiceById, updateInvoiceStatus } from "@/features/invoices/api";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { NewPaymentInput, Payment, UpdatePaymentInput } from "@/types/payment";

/**
 * Data-access functions for the Payments module. Same pattern as every
 * prior module's api.ts — accept a SupabaseClient so these work with
 * either the server client (page load) or the browser client
 * (interactive updates from a "use client" component).
 *
 * Naming follows the established getXById convention (getInvoiceById,
 * getProjectById, etc.) to stay consistent with the rest of the codebase.
 */

export async function getPayments(
  supabase: SupabaseClient,
  invoiceId: string
): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("invoice_id", invoiceId)
    .order("paid_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Payment[];
}

export async function getPaymentById(
  supabase: SupabaseClient,
  id: string
): Promise<Payment | null> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as Payment | null;
}

/**
 * Recalculates total paid for an invoice and updates its status to
 * match, reusing getInvoiceById/updateInvoiceStatus from
 * features/invoices/api.ts rather than duplicating invoice logic here:
 *
 *   0 paid                    -> "sent" (left alone if still "draft")
 *   0 < paid < invoice.amount -> "partially_paid"
 *   paid >= invoice.amount    -> "paid"
 *
 * Called after every create/update/delete below so the invoice's status
 * always reflects its actual payment total. Not exported — it's an
 * internal step of this module's mutations, not a standalone action.
 */
async function syncInvoiceStatus(supabase: SupabaseClient, invoiceId: string): Promise<void> {
  const invoice = await getInvoiceById(supabase, invoiceId);
  if (!invoice) return;

  const payments = await getPayments(supabase, invoiceId);
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

  let nextStatus = invoice.status;
  if (totalPaid <= 0) {
    if (invoice.status !== "draft") nextStatus = "sent";
  } else if (totalPaid < invoice.amount) {
    nextStatus = "partially_paid";
  } else {
    nextStatus = "paid";
  }

  if (nextStatus !== invoice.status) {
    await updateInvoiceStatus(supabase, invoiceId, nextStatus);
  }
}

/**
 * Creates a payment against an invoice, then re-syncs that invoice's
 * status. Rejects (before writing anything) if the new payment would
 * push the invoice's total paid above its amount — payments can never
 * exceed the invoice's remaining balance.
 */
export async function createPayment(
  supabase: SupabaseClient,
  input: NewPaymentInput
): Promise<Payment> {
  const invoice = await getInvoiceById(supabase, input.invoice_id);
  if (!invoice) throw new Error("Invoice not found.");

  const existingPayments = await getPayments(supabase, input.invoice_id);
  const currentTotal = existingPayments.reduce((sum, payment) => sum + payment.amount, 0);

  if (currentTotal + input.amount > invoice.amount) {
    throw new Error("This payment would exceed the invoice's remaining balance.");
  }

  const { data, error } = await supabase
    .from("payments")
    .insert({
      invoice_id: input.invoice_id,
      amount: input.amount,
      payment_method: input.payment_method,
      paid_at: input.paid_at,
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await syncInvoiceStatus(supabase, input.invoice_id);

  return data as Payment;
}

/**
 * Updates an existing payment, then re-syncs its invoice's status.
 * Rejects (before writing anything) if changing the amount would push
 * the invoice's total paid above its amount, excluding this payment's
 * own current amount from that check (so editing a payment to the same
 * or a smaller amount always succeeds).
 */
export async function updatePayment(
  supabase: SupabaseClient,
  id: string,
  updates: UpdatePaymentInput
): Promise<void> {
  const existingPayment = await getPaymentById(supabase, id);
  if (!existingPayment) throw new Error("Payment not found.");

  if (updates.amount !== undefined) {
    const invoice = await getInvoiceById(supabase, existingPayment.invoice_id);
    if (!invoice) throw new Error("Invoice not found.");

    const otherPayments = await getPayments(supabase, existingPayment.invoice_id);
    const totalExcludingThis = otherPayments
      .filter((payment) => payment.id !== id)
      .reduce((sum, payment) => sum + payment.amount, 0);

    if (totalExcludingThis + updates.amount > invoice.amount) {
      throw new Error("This payment would exceed the invoice's remaining balance.");
    }
  }

  const { error } = await supabase.from("payments").update(updates).eq("id", id);
  if (error) throw new Error(error.message);

  await syncInvoiceStatus(supabase, existingPayment.invoice_id);
}

/**
 * Deletes a payment, then re-syncs its invoice's status (the invoice's
 * total paid drops, so its status may need to move back to
 * "partially_paid" or "sent").
 */
export async function deletePayment(supabase: SupabaseClient, id: string): Promise<void> {
  const existingPayment = await getPaymentById(supabase, id);
  if (!existingPayment) throw new Error("Payment not found.");

  const { error } = await supabase.from("payments").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await syncInvoiceStatus(supabase, existingPayment.invoice_id);
}