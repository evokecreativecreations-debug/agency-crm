import type { SupabaseClient } from "@supabase/supabase-js";
import type { BillingFields, Quotation } from "@/types/billing";
import { validateBilling } from "./billing";
export async function saveQuotation(
  db: SupabaseClient,
  fields: BillingFields & {
    lead_id: string | null;
    client_id: string | null;
    valid_until: string | null;
  },
  id?: string,
) {
  const amount = validateBilling(fields);
  const payload = { ...fields, amount };
  const query = id
    ? db.from("quotations").update(payload).eq("id", id)
    : db
        .from("quotations")
        .insert({
          ...payload,
          quotation_number: "AUTO",
          recipient_name: "",
          recipient_email: "",
        });
  const { data, error } = await query.select().single();
  if (error) throw new Error(error.message);
  return data as Quotation;
}
