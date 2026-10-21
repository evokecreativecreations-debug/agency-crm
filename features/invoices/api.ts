import { validateBilling } from './billing';
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Invoice,
  InvoiceStatus,
  NewInvoiceInput,
  UpdateInvoiceInput,
} from "@/types/invoice";

/**
 * Data-access functions for the Invoices module. Same pattern as every
 * prior module's api.ts (features/tasks/api.ts, features/projects/api.ts,
 * features/clients/api.ts, features/revisions/api.ts) — accept a
 * SupabaseClient so these work with either the server client (page load)
 * or the browser client (interactive updates from a "use client"
 * component).
 *
 * Naming follows the established getXById convention (getProjectById,
 * getTaskById, getRevisionById, etc.) to stay consistent with the rest
 * of the codebase.
 */

export async function getInvoices(
  supabase: SupabaseClient,
  projectId: string
): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Invoice[];
}

export async function getInvoiceById(
  supabase: SupabaseClient,
  id: string
): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as Invoice | null;
}

export async function createInvoice(
  supabase: SupabaseClient,
  input: NewInvoiceInput
): Promise<Invoice> {
  validateBilling(input);

  const { data, error } = await supabase
    .from("invoices")
    .insert({
      project_id: input.project_id,
      invoice_number: "AUTO",
      line_items: input.line_items,
      discount_amount: input.discount_amount,
      tax_rate: input.tax_rate,
      deposit_amount: input.deposit_amount,
      notes: input.notes,
      payment_terms: input.payment_terms,
      amount: input.amount,
      due_date: input.due_date || null,
      status: "draft",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Invoice;
}

export async function updateInvoice(
  supabase: SupabaseClient,
  id: string,
  updates: UpdateInvoiceInput
): Promise<void> {
  const { error } = await supabase.from("invoices").update(updates).eq("id", id);
  if (error) throw new Error(error.message);
}

/** Convenience wrapper around updateInvoice for the common case of just
 * changing status — avoids duplicating the update call at every call site
 * (same approach as updateTaskStatus/updateProjectStatus/updateRevisionStatus). */
export async function updateInvoiceStatus(
  supabase: SupabaseClient,
  id: string,
  status: InvoiceStatus
): Promise<void> {
  await updateInvoice(supabase, id, { status });
}