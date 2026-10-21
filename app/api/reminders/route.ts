import { createClient } from "@/lib/supabase/server";
export async function POST(request: Request) {
  // Next can normalise request.url to localhost behind a proxy. Match the
  // browser Origin to the actual Host header, never a caller-supplied forwarded host.
  let sameOrigin = false;
  try {
    const value = request.headers.get("origin") ?? "";
    const origin = new URL(value);
    const host = request.headers.get("host") ?? new URL(request.url).host;
    sameOrigin = value === origin.origin && ["https:", "http:"].includes(origin.protocol) && origin.host === host;
  } catch { /* Missing or malformed Origin is not a browser same-origin request. */ }
  if (!sameOrigin) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const db = await createClient();
  const {
    data: { user },
    error: authError,
  } = await db.auth.getUser();
  if (authError || !user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await db.rpc("collect_due_followups");
  if (error)
    return Response.json(
      { error: "Reminders need the latest database update." },
      { status: 503 },
    );
  return Response.json(
    { created: data },
    { headers: { "Cache-Control": "no-store" } },
  );
}
