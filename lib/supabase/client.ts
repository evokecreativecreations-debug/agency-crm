/**
 * Supabase client for use in the BROWSER (client components).
 *
 * Import this in any file marked "use client" that needs to talk to Supabase
 * — for example, a form that creates a new lead.
 *
 * Example:
 *   import { createClient } from "@/lib/supabase/client";
 *   const supabase = createClient();
 *   const { data } = await supabase.from("leads").select("*");
 */
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
