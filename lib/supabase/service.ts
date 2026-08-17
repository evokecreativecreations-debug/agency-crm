import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — bypasses Row Level Security entirely.
 *
 * ONLY use this in server-only code (API routes, never in a "use client"
 * file, never sent to the browser) where there is no logged-in user to
 * check against — for example, the public /api/inquiries endpoint that
 * your website's contact form posts to.
 *
 * Do NOT use this for anything a logged-in team member does — use
 * lib/supabase/server.ts (respects RLS, tied to the real user) instead.
 */
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}