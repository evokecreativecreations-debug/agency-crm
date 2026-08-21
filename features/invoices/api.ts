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

const INVOICE_NUMBER_PREFIX = "INV-";
const INVOICE_NUMBER_PAD_LENGTH = 4;

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

/**
 * Generates the next sequential invoice number (INV-0001, INV-0002, ...)
 * by looking at the single most recently created invoice across the
 * whole agency (invoice_number is globally unique per the blueprint, not
 * scoped per project — one numbering sequence company-wide, matching
 * standard invoicing practice). Not safe against a race between two
 * simultaneous creates, but the table's UNIQUE constraint on
 * invoice_number guarantees a collision fails loudly instead of silently
 * overwriting — acceptable for a single small team, per the brief.
 */
async function generateNextInvoiceNumber(supabase: SupabaseClient): Promise<string> {
  const { data, error } = await supabase
    .from("invoices")
    .select("invoice_number")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);

  const match = data?.invoice_number.match(/(\d+)$/);
  const nextNumber = match ? parseInt(match[1], 10) + 1 : 1;

  return `${INVOICE_NUMBER_PREFIX}${String(nextNumber).padStart(INVOICE_NUMBER_PAD_LENGTH, "0")}`;
}

export async function createInvoice(
  supabase: SupabaseClient,
  input: NewInvoiceInput
): Promise<Invoice> {
  const invoiceNumber = await generateNextInvoiceNumber(supabase);

  const { data, error } = await supabase
    .from("invoices")
    .insert({
      project_id: input.project_id,
      invoice_number: invoiceNumber,
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