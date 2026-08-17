import type { SupabaseClient } from "@supabase/supabase-js";
import type { Inquiry, InquiryStatus, NewInquiryInput } from "@/types/inquiry";

/**
 * Data-access functions for the Inquiries module. Accept a SupabaseClient
 * so they work with either the server client (page load) or the browser
 * client (interactive updates from a "use client" component) — see
 * lib/supabase/server.ts and lib/supabase/client.ts.
 */

export async function getInquiries(supabase: SupabaseClient): Promise<Inquiry[]> {
  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Inquiry[];
}

export async function createInquiry(
  supabase: SupabaseClient,
  input: NewInquiryInput
): Promise<Inquiry> {
  const { data, error } = await supabase
    .from("inquiries")
    .insert({
      full_name: input.full_name,
      email: input.email,
      phone: input.phone || null,
      message: input.message,
      source: "manual",
      status: "new",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Inquiry;
}

export async function updateInquiryStatus(
  supabase: SupabaseClient,
  id: string,
  status: InquiryStatus
): Promise<void> {
  const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}