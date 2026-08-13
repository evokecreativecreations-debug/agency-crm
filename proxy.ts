import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Route protection. Mirrors the module list in lib/navigation.ts — if a
 * new dashboard module is added there, add its path prefix here too.
 * "/" and "/style-guide" stay public on purpose (Phase 0 status page and
 * the internal design-system reference).
 */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/inquiries",
  "/leads",
  "/clients",
  "/projects",
  "/invoices",
  "/payments",
  "/messages",
  "/files",
  "/services",
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
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicOnly && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
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
