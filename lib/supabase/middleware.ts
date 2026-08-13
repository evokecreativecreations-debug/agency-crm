import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase session on every request and keeps auth cookies
 * in sync between the browser and the server. Called from the root
 * middleware.ts — don't call this anywhere else.
 *
 * Returns both the (possibly redirected) response and the current user,
 * so middleware.ts can make route-protection decisions without a second
 * round trip to Supabase.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // IMPORTANT: do not remove this call. It refreshes the auth token and
    // is what keeps the user's session alive across requests.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return { response, user };
  } catch {
    // Supabase not configured yet (e.g. .env.local still has placeholder
    // values) or a transient network error — fail safe as "logged out"
    // instead of crashing the request. Protected routes will correctly
    // redirect to /login rather than showing a 500 error.
    return { response, user: null };
  }
}
