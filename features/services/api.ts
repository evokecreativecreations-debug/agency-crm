import type { SupabaseClient } from "@supabase/supabase-js";
import type { NewServiceInput, Service, ServiceUpdateInput } from "@/types/service";

/** Data-access functions for the Services Catalog. */
export async function getServices(
  supabase: SupabaseClient,
  includeInactive = true
): Promise<Service[]> {
  let query = supabase.from("services").select("*").order("name", { ascending: true });
  if (!includeInactive) query = query.eq("is_active", true);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as Service[];
}

export async function getServiceById(
  supabase: SupabaseClient,
  id: string
): Promise<Service | null> {
  const { data, error } = await supabase.from("services").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as Service | null;
}

export async function createService(
  supabase: SupabaseClient,
  input: NewServiceInput
): Promise<Service> {
  const { data, error } = await supabase
    .from("services")
    .insert({
      name: input.name.trim(),
      description: input.description?.trim() || null,
      default_price: input.default_price ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Service;
}

export async function updateService(
  supabase: SupabaseClient,
  id: string,
  updates: ServiceUpdateInput
): Promise<void> {
  const { error } = await supabase.from("services").update(updates).eq("id", id);
  if (error) throw new Error(error.message);
}
