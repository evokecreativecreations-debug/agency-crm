import { NextResponse } from "next/server";
import {
  createGmailClient,
  getGmailTokens,
} from "@/lib/gmail/client";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

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
          refresh_token: tokens.refresh_token ?? null,
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
  } catch (error) {
    console.error("Gmail callback error:", error);

    return NextResponse.json(
      { error: "Failed to complete Gmail authentication" },
      { status: 500 }
    );
  }
}
