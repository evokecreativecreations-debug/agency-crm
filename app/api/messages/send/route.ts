import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createMessage } from "@/features/messages/api";

type SendMessageBody = {
  conversationId: string;
  bodyText: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SendMessageBody;

    if (!body.conversationId || !body.bodyText?.trim()) {
      return NextResponse.json(
        { error: "conversationId and bodyText are required" },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;

    if (!resendApiKey || !fromEmail) {
      return NextResponse.json(
        { error: "Resend environment variables are not configured" },
        { status: 500 }
      );
    }

    const supabase = await createClient();

    const { data: conversation, error: conversationError } =
      await supabase
        .from("conversations")
        .select("*")
        .eq("id", body.conversationId)
        .single();

    if (conversationError || !conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [conversation.participant_email],
        subject: conversation.subject,
        text: body.bodyText.trim(),
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend error:", resendData);

      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 502 }
      );
    }

    const message = await createMessage(supabase, {
      conversation_id: conversation.id,
      sender_email: fromEmail,
      sender_name: null,
      recipient_email: conversation.participant_email,
      recipient_name: conversation.participant_name,
      subject: conversation.subject,
      body_text: body.bodyText.trim(),
      body_html: null,
      direction: "outbound",
      status: "sent",
      gmail_message_id: null,
      gmail_thread_id: conversation.gmail_thread_id,
      resend_email_id: resendData.id ?? null,
    });

    await supabase
      .from("conversations")
      .update({
        last_message_at: message.sent_at,
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversation.id);

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Send message error:", error);

    return NextResponse.json(
      { error: "Unexpected error while sending message" },
      { status: 500 }
    );
  }
}