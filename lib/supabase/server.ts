/**
 * Supabase client for use on the SERVER (Server Components, API routes).
 *
 * Import this in any server-side file that needs to talk to Supabase
 * — for example, an API route that creates an inquiry, or a dashboard
 * page that loads data before sending it to the browser.
 *
 * Example:
 *   import { createClient } from "@/lib/supabase/server";
 *   const supabase = await createClient();
 *   const { data } = await supabase.from("leads").select("*");
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll was called from a Server Component that can't set
            // cookies directly. This is safe to ignore if middleware
            // is refreshing the user's session (added in Phase 1).
          }
        },
      },
    }
  );
}
