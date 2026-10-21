import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Route protection. Mirrors the module list in lib/navigation.ts — if a
 * new dashboard module is added there, add its path prefix here too.
 * The root redirects into the protected dashboard. The style guide remains
 * public and contains design examples only.
 */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/today",
  "/quotations",
  "/inquiries",
  "/leads",
  "/clients",
  "/projects",
  "/invoices",
  "/payments",
  "/messages",
  "/files",
  "/services",
  "/notifications",
  "/profile",
  "/settings",
];

const PUBLIC_ONLY_PATHS = ["/login"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isPublicOnly = PUBLIC_ONLY_PATHS.includes(pathname);

  // Public pages (e.g. "/", "/style-guide") never need a session check —
  // skip Supabase entirely so they keep working even before Supabase is
  // configured, and so we're not paying for an auth round trip on every
  // request that doesn't need one.
  if (!isProtected && !isPublicOnly) {
    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);

  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    const redirect = NextResponse.redirect(loginUrl);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }

  if (isPublicOnly && user) {
    const redirect = NextResponse.redirect(new URL("/dashboard", request.url));
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on every path except static assets, the PWA files, and the
     * favicon — those never need auth checks.
     */
    "/((?!_next/static|_next/image|favicon.ico|icons|sw.js|manifest.webmanifest).*)",
  ],
};
