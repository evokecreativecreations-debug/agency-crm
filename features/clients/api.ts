import { updateLeadStatus } from "@/features/leads/api";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Client, NewClientInput } from "@/types/client";

/**
 * Data-access functions for the Clients module. Same pattern as
 * features/inquiries/api.ts and features/leads/api.ts — accept a
 * SupabaseClient so these work with either the server client (page load)
 * or the browser client (interactive updates from a "use client"
 * component).
 */

export async function getClients(supabase: SupabaseClient): Promise<Client[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Client[];
}

export async function getClientById(
  supabase: SupabaseClient,
  id: string
): Promise<Client | null> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as Client | null;
}

/**
 * Returns the set of lead IDs that already have a client (i.e. leads
 * that have already been converted). Used by LeadsView to hide the
 * "Convert to Client" action and show a "Client" badge instead — the
 * same before/after pattern InquiriesView uses for converted_to_lead,
 * just derived from a lookup instead of a status column (clients have
 * no status field in the frozen schema).
 */
export async function getConvertedLeadIds(supabase: SupabaseClient): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("clients")
    .select("lead_id")
    .not("lead_id", "is", null);

  if (error) throw new Error(error.message);
  return new Set((data as { lead_id: string }[]).map((row) => row.lead_id));
}

async function createClientRecord(
  supabase: SupabaseClient,
  input: NewClientInput
): Promise<Client> {
  const { data, error } = await supabase
    .from("clients")
    .insert({
      lead_id: input.lead_id ?? null,
      full_name: input.full_name,
      company_name: input.company_name || null,
      email: input.email,
      phone: input.phone || null,
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Client;
}

/**
 * Converts a lead into a client: checks the lead hasn't already been
 * converted (app-level guard — the database also enforces this with a
 * unique constraint on clients.lead_id as a second line of defense),
 * creates the client (linking back via lead_id), then marks the source
 * lead "won" — the only schema-compliant status implying a closed deal
 * (the frozen leads.status check only allows contacted/negotiating/
 * won/lost). Reuses features/leads/api.ts's updateLeadStatus rather than
 * duplicating that logic here, same approach as Phase 4's
 * convertInquiryToLead.
 */
export async function convertLeadToClient(
  supabase: SupabaseClient,
  leadId: string,
  input: Omit<NewClientInput, "lead_id">
): Promise<Client> {
  const { data: existing, error: checkError } = await supabase
    .from("clients")
    .select("id")
    .eq("lead_id", leadId)
    .maybeSingle();

  if (checkError) throw new Error(checkError.message);
  if (existing) {
    throw new Error("This lead has already been converted to a client.");
  }

  const client = await createClientRecord(supabase, { ...input, lead_id: leadId });
  await updateLeadStatus(supabase, leadId, "won");
  return client;
}