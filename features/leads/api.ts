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

export async function getLeadById(supabase: SupabaseClient, id: string): Promise<Lead | null> {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as Lead | null;
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
 * Atomically creates/reuses a lead and updates its inquiry in one database
 * transaction. The RPC locks the inquiry so concurrent requests and retries
 * return the same lead. Do not fall back to separate browser writes.
 */
export async function convertInquiryToLead(
  supabase: SupabaseClient,
  inquiryId: string,
  input: Omit<NewLeadInput, "inquiry_id">
): Promise<Lead> {
  const { data, error } = await supabase.rpc("convert_inquiry_to_lead", {
    p_inquiry_id: inquiryId,
    p_full_name: input.full_name,
    p_email: input.email,
    p_phone: input.phone || null,
    p_notes: input.notes || null,
  }).single();

  if (error) {
    if (error.code === "PGRST202" || error.code === "42883") {
      throw new Error("Lead conversion needs the latest database migration. Please contact your administrator.");
    }
    throw new Error(error.message);
  }
  if (!data) throw new Error("Lead conversion returned no result.");
  return data as Lead;
}

export async function deleteLead(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("leads")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}