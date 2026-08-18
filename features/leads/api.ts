import { updateInquiryStatus } from "@/features/inquiries/api";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Lead, LeadStatus, NewLeadInput } from "@/types/lead";

/**
 * Data-access functions for the Leads module. Same pattern as
 * features/inquiries/api.ts — accept a SupabaseClient so these work with
 * either the server client (page load) or the browser client
 * (interactive updates from a "use client" component).
 */

export async function getLeads(supabase: SupabaseClient): Promise<Lead[]> {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Lead[];
}

export async function createLead(
  supabase: SupabaseClient,
  input: NewLeadInput
): Promise<Lead> {
  const { data, error } = await supabase
    .from("leads")
    .insert({
      inquiry_id: input.inquiry_id ?? null,
      full_name: input.full_name,
      email: input.email,
      phone: input.phone || null,
      notes: input.notes || null,
      status: "contacted",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Lead;
}

export async function updateLeadStatus(
  supabase: SupabaseClient,
  id: string,
  status: LeadStatus
): Promise<void> {
  const { error } = await supabase.from("leads").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

/**
 * Converts an inquiry into a lead: creates the lead (carrying over the
 * inquiry's contact details and linking back via inquiry_id), then marks
 * the source inquiry as "converted_to_lead". Reuses
 * features/inquiries/api.ts's updateInquiryStatus rather than duplicating
 * that logic here.
 *
 * If the lead is created successfully but the inquiry-status update
 * fails, the error is re-thrown so the caller can surface it — the lead
 * still exists either way, so no data is lost, but the inquiry's status
 * may need a manual retry.
 */
export async function convertInquiryToLead(
  supabase: SupabaseClient,
  inquiryId: string,
  input: Omit<NewLeadInput, "inquiry_id">
): Promise<Lead> {
  const lead = await createLead(supabase, { ...input, inquiry_id: inquiryId });
  await updateInquiryStatus(supabase, inquiryId, "converted_to_lead");
  return lead;
}