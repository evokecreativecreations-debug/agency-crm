export async function convertInquiryToLead(
  supabase: SupabaseClient,
  inquiryId: string,
  input: {
    full_name: string;
    email: string;
    phone?: string;
    notes?: string;
  }
): Promise<Lead> {
  // Fetch inquiry
  const { data: inquiry, error: fetchError } = await supabase
    .from("inquiries")
    .select("*")
    .eq("id", inquiryId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch inquiry: ${fetchError.message}`);
  }

  const typedInquiry = inquiry as Inquiry;

  // Create lead using edited values from dialog
  const lead = await createLead(supabase, {
    inquiry_id: inquiryId,
    full_name: input.full_name,
    email: input.email,
    phone: input.phone,
    notes:
      input.notes ||
      `Converted from Inquiry.\n\nOriginal Message:\n${typedInquiry.message}`,
  });

  try {
    await updateInquiryStatus(supabase, inquiryId, "converted_to_lead");
  } catch (error) {
    await supabase.from("leads").delete().eq("id", lead.id);
    throw error;
  }

  return lead;
}