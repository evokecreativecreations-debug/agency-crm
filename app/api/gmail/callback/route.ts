import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { timingSafeEqual } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import {
  createGmailClient,
  getGmailTokens,
} from "@/lib/gmail/client";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: Request) {
  try {
    const supabaseSession = await createClient();
    const { data: { user }, error: userError } = await supabaseSession.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = new URL(request.url);
    const cookieStore = await cookies();
    const expectedState = cookieStore.get("gmail_oauth_state")?.value;
    const state = url.searchParams.get("state");
    if (!state || !expectedState || !state.startsWith(`${user.id}.`) ||
        Buffer.byteLength(state) !== Buffer.byteLength(expectedState) ||
        !timingSafeEqual(Buffer.from(state), Buffer.from(expectedState))) {
      return NextResponse.json({ error: "Invalid or expired OAuth state" }, { status: 400 });
    }
    cookieStore.set("gmail_oauth_state", "", { path: "/api/gmail", maxAge: 0 });

    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    if (error) {
      return NextResponse.json(
        { error: `Google OAuth error: ${error}` },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: "Missing OAuth code" },
        { status: 400 }
      );
    }

    const tokens = await getGmailTokens(code);

    if (!tokens.access_token) {
      throw new Error("No access token returned by Google.");
    }

    const gmail = createGmailClient(tokens.access_token);

    const profile = await gmail.users.getProfile({
      userId: "me",
    });

    const email = profile.data.emailAddress;

    if (!email) {
      throw new Error("Unable to determine Gmail address.");
    }

    const supabase = createServiceClient();

    const { error: dbError } = await supabase
      .from("gmail_connections")
      .upsert(
        {
          email,
          access_token: tokens.access_token,
          // Google may omit refresh_token on reconnect. Preserve the stored token.
          ...(tokens.refresh_token ? { refresh_token: tokens.refresh_token } : {}),
          expiry_date: tokens.expiry_date
            ? new Date(tokens.expiry_date).toISOString()
            : null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "email",
        }
      );

    if (dbError) {
      console.error("Gmail connection database error:", dbError);
      throw dbError;
    }

    return NextResponse.json({
      success: true,
      email,
      message: "Gmail account connected successfully.",
    });
  } catch {
    // OAuth errors can contain tokens in their request metadata.
    console.error("Gmail callback failed");

    return NextResponse.json(
      { error: "Failed to complete Gmail authentication" },
      { status: 500 }
    );
  }
}
