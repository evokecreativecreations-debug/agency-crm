import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getGmailAuthUrl } from "@/lib/gmail/client";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const state = `${user.id}.${crypto.randomUUID()}`;
    const authUrl = getGmailAuthUrl(state);
    const cookieStore = await cookies();
    cookieStore.set("gmail_oauth_state", state, {
      httpOnly: true,
      secure: new URL(request.url).protocol === "https:",
      sameSite: "lax",
      path: "/api/gmail",
      maxAge: 600,
    });
    return NextResponse.redirect(authUrl);
  } catch {
    return NextResponse.json(
      { error: "Unable to start Gmail authentication" },
      { status: 500 }
    );
  }
}
