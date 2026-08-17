import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse, type NextRequest } from "next/server";

/**
 * POST /api/inquiries — the bridge from your existing website's contact
 * form into the CRM. This does NOT require a logged-in session (the
 * website itself isn't logged in) — instead it checks a shared secret
 * header, then writes using the service-role client (see
 * lib/supabase/service.ts), which bypasses Row Level Security.
 *
 * Your website's contact form should POST JSON like:
 *   {
 *     "full_name": "Jane Cooper",
 *     "email": "jane@company.com",
 *     "phone": "+1 555 0100",       (optional)
 *     "message": "I'd like a quote for..."
 *   }
 * with header: x-inquiry-secret: <INQUIRY_API_SECRET from .env.local>
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function withCors(response: NextResponse) {
  const origin = process.env.WEBSITE_ORIGIN || "*";
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, x-inquiry-secret");
  return response;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-inquiry-secret");
  if (!secret || secret !== process.env.INQUIRY_API_SECRET) {
    return withCors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return withCors(NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }));
  }

  const { full_name, email, phone, message } = (body ?? {}) as Record<string, unknown>;

  if (typeof full_name !== "string" || full_name.trim().length === 0) {
    return withCors(NextResponse.json({ error: "full_name is required" }, { status: 400 }));
  }
  if (typeof email !== "string" || !EMAIL_REGEX.test(email)) {
    return withCors(NextResponse.json({ error: "A valid email is required" }, { status: 400 }));
  }
  if (typeof message !== "string" || message.trim().length === 0) {
    return withCors(NextResponse.json({ error: "message is required" }, { status: 400 }));
  }
  if (phone !== undefined && typeof phone !== "string") {
    return withCors(NextResponse.json({ error: "phone must be a string" }, { status: 400 }));
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("inquiries")
    .insert({
      full_name: full_name.trim(),
      email: email.trim(),
      phone: phone ? (phone as string).trim() : null,
      message: message.trim(),
      source: "website_form",
      status: "new",
    })
    .select("id")
    .single();

  if (error) {
    return withCors(NextResponse.json({ error: "Failed to save inquiry" }, { status: 500 }));
  }

  return withCors(NextResponse.json({ success: true, id: data.id }, { status: 201 }));
}