import { NextResponse } from "next/server";
import { getGmailAuthUrl } from "@/lib/gmail/client";

export async function GET() {
  try {


    // Temporary state value.
    // We will replace this with a secure persisted OAuth state
    // when we add the Gmail connection record.
    const state = crypto.randomUUID();

    const authUrl = getGmailAuthUrl(state);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Gmail auth error:", error);

    return NextResponse.json(
      { error: "Unable to start Gmail authentication" },
      { status: 500 }
    );
  }
}