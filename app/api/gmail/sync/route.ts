import { NextResponse } from "next/server";

import { createGmailClient } from "@/lib/gmail/client";
import { createServiceClient } from "@/lib/supabase/service";

type GmailHeader = {
  name?: string | null;
  value?: string | null;
};

type GmailPart = {
  mimeType?: string | null;
  body?: {
    data?: string | null;
  } | null;
  parts?: GmailPart[] | null;
};

function decodeBase64Url(data: string): string {
  const normalized = data
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .replace(/\s/g, "");

  const padding = normalized.length % 4;
  const padded =
    padding === 0 ? normalized : normalized + "=".repeat(4 - padding);

  return Buffer.from(padded, "base64").toString("utf8");
}

function getHeader(
  headers: GmailHeader[],
  name: string
): string | null {
  const header = headers.find(
    (item) => item.name?.toLowerCase() === name.toLowerCase()
  );

  return header?.value?.trim() || null;
}

function extractEmail(value: string | null): string | null {
  if (!value) return null;

  const match = value.match(/<([^>]+)>/);

  if (match?.[1]) {
    return match[1].trim();
  }

  const emailMatch = value.match(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
  );

  return emailMatch?.[0]?.trim() ?? value.trim();
}

function extractName(value: string | null): string | null {
  if (!value) return null;

  const match = value.match(/^"?([^"<]+?)"?\s*<[^>]+>$/);

  if (match?.[1]) {
    return match[1].trim();
  }

  return null;
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractBody(
  payload: GmailPart | null | undefined
): {
  text: string;
  html: string | null;
} {
  const textParts: string[] = [];
  const htmlParts: string[] = [];

  function walk(part: GmailPart | null | undefined) {
    if (!part) return;

    const mimeType = part.mimeType?.toLowerCase() ?? "";
    const data = part.body?.data;

    if (data) {
      const decoded = decodeBase64Url(data);

      if (mimeType === "text/plain") {
        textParts.push(decoded);
      }

      if (mimeType === "text/html") {
        htmlParts.push(decoded);
      }

      // Some simple Gmail messages put the body directly
      // on the root payload without nested parts.
      if (!part.parts?.length && !mimeType) {
        textParts.push(decoded);
      }
    }

    for (const child of part.parts ?? []) {
      walk(child);
    }
  }

  walk(payload);

  const text = textParts
    .join("\n")
    .replace(/\r/g, "")
    .trim();

  const html =
    htmlParts.length > 0
      ? htmlParts.join("\n").trim()
      : null;

  return {
    text: text || (html ? stripHtml(html) : ""),
    html,
  };
}

function parseDate(value: string | null): string {
  if (!value) {
    return new Date().toISOString();
  }

  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return new Date().toISOString();
  }

  return new Date(timestamp).toISOString();
}

export async function GET() {
  try {
    const supabase = createServiceClient();

    const { data: connection, error: connectionError } =
      await supabase
        .from("gmail_connections")
        .select("*")
        .limit(1)
        .single();

    if (connectionError || !connection) {
      console.error(
        "Gmail connection lookup error:",
        connectionError
      );

      return NextResponse.json(
        { error: "No Gmail account connected." },
        { status: 404 }
      );
    }

    const gmail = createGmailClient(
      connection.access_token,
      connection.refresh_token
    );

    const listResult = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
    });

    const messageRefs = listResult.data.messages ?? [];

    let syncedCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;
    let insertedCount = 0;

    for (const messageRef of messageRefs) {
      if (!messageRef.id) {
        skippedCount++;
        continue;
      }

      const result = await gmail.users.messages.get({
        userId: "me",
        id: messageRef.id,
        format: "full",
      });

      const message = result.data;
      const payload = message.payload;

      if (!message.id || !payload) {
        skippedCount++;
        continue;
      }

      const headers = (payload.headers ?? []) as GmailHeader[];

      const fromHeader = getHeader(headers, "From");
      const toHeader = getHeader(headers, "To");
      const subject =
        getHeader(headers, "Subject") || "(No subject)";
      const dateHeader = getHeader(headers, "Date");

      const senderEmail = extractEmail(fromHeader);
      const senderName = extractName(fromHeader);

      const recipientEmail = extractEmail(toHeader);
      const recipientName = extractName(toHeader);

      if (!senderEmail || !recipientEmail) {
        console.warn(
          "Skipping Gmail message because sender/recipient is missing:",
          message.id
        );

        skippedCount++;
        continue;
      }

      const body = extractBody(payload as GmailPart);

      const gmailMessageId = message.id;
      const gmailThreadId = message.threadId ?? null;
      const sentAt = parseDate(dateHeader);

      const direction =
        senderEmail.toLowerCase() ===
        connection.email.toLowerCase()
          ? "outbound"
          : "inbound";

      /*
       * IMPORTANT:
       * Check whether this Gmail message already exists.
       *
       * Previously this code skipped existing records completely.
       * Now we UPDATE them with the fresh Gmail body.
       */
      const { data: existingMessage, error: existingError } =
        await supabase
          .from("messages")
          .select("id, conversation_id")
          .eq("gmail_message_id", gmailMessageId)
          .maybeSingle();

      if (existingError) {
        console.error(
          "Existing Gmail message lookup error:",
          existingError
        );

        throw existingError;
      }

      if (existingMessage) {
        /*
         * Existing Gmail message:
         * refresh its body/content/metadata.
         */
        const { error: updateMessageError } = await supabase
          .from("messages")
          .update({
            sender_email: senderEmail,
            sender_name: senderName,
            recipient_email: recipientEmail,
            recipient_name: recipientName,
            subject,
            body_text:
              body.text || "(No text content)",
            body_html: body.html,
            direction,
            status: "sent",
            gmail_thread_id: gmailThreadId,
            sent_at: sentAt,
          })
          .eq("id", existingMessage.id);

        if (updateMessageError) {
          console.error(
            "Gmail message update error:",
            updateMessageError
          );

          throw updateMessageError;
        }

        /*
         * Keep the existing conversation.
         * Do NOT create another conversation.
         */
        const { error: conversationUpdateError } =
          await supabase
            .from("conversations")
            .update({
              subject,
              participant_email:
                direction === "inbound"
                  ? senderEmail
                  : recipientEmail,
              participant_name:
                direction === "inbound"
                  ? senderName
                  : recipientName,
              gmail_thread_id: gmailThreadId,
              last_message_at: sentAt,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingMessage.conversation_id);

        if (conversationUpdateError) {
          console.error(
            "Existing conversation update error:",
            conversationUpdateError
          );

          throw conversationUpdateError;
        }

        updatedCount++;
        syncedCount++;

        continue;
      }

      /*
       * Message does not exist yet.
       *
       * Find the conversation by Gmail thread ID.
       */
      let conversationId: string | null = null;

      if (gmailThreadId) {
        const {
          data: existingConversation,
          error: conversationLookupError,
        } = await supabase
          .from("conversations")
          .select("id")
          .eq("gmail_thread_id", gmailThreadId)
          .maybeSingle();

        if (conversationLookupError) {
          console.error(
            "Conversation lookup error:",
            conversationLookupError
          );

          throw conversationLookupError;
        }

        conversationId =
          existingConversation?.id ?? null;
      }

      /*
       * No conversation for this thread yet.
       * Create one.
       */
      if (!conversationId) {
        const participantEmail =
          direction === "inbound"
            ? senderEmail
            : recipientEmail;

        const participantName =
          direction === "inbound"
            ? senderName
            : recipientName;

        const {
          data: newConversation,
          error: conversationInsertError,
        } = await supabase
          .from("conversations")
          .insert({
            subject,
            participant_email: participantEmail,
            participant_name: participantName,
            gmail_thread_id: gmailThreadId,
            last_message_at: sentAt,
          })
          .select("id")
          .single();

        if (
          conversationInsertError ||
          !newConversation
        ) {
          console.error(
            "Conversation insert error:",
            conversationInsertError
          );

          throw (
            conversationInsertError ??
            new Error("Failed to create conversation.")
          );
        }

        conversationId = newConversation.id;
      }

      /*
       * Insert the new Gmail message.
       */
      const { error: messageInsertError } =
        await supabase
          .from("messages")
          .insert({
            conversation_id: conversationId,
            sender_email: senderEmail,
            sender_name: senderName,
            recipient_email: recipientEmail,
            recipient_name: recipientName,
            subject,
            body_text:
              body.text || "(No text content)",
            body_html: body.html,
            direction,
            status: "sent",
            gmail_message_id: gmailMessageId,
            gmail_thread_id: gmailThreadId,
            sent_at: sentAt,
          });

      if (messageInsertError) {
        if (messageInsertError.code === "23505") {
          skippedCount++;
          continue;
        }

        console.error(
          "Gmail message insert error:",
          messageInsertError
        );

        throw messageInsertError;
      }

      /*
       * Update conversation with newest message.
       */
      const { error: conversationUpdateError } =
        await supabase
          .from("conversations")
          .update({
            subject,
            last_message_at: sentAt,
            updated_at: new Date().toISOString(),
          })
          .eq("id", conversationId);

      if (conversationUpdateError) {
        console.error(
          "Conversation update error:",
          conversationUpdateError
        );

        throw conversationUpdateError;
      }

      insertedCount++;
      syncedCount++;
    }

    return NextResponse.json({
      success: true,
      email: connection.email,
      fetched: messageRefs.length,
      synced: syncedCount,
      updated: updatedCount,
      inserted: insertedCount,
      skipped: skippedCount,
      message:
        "Gmail messages synced and existing messages refreshed successfully.",
    });
  } catch (error) {
    console.error("Gmail sync error:", error);

    return NextResponse.json(
      {
        error: "Failed to sync Gmail messages.",
      },
      { status: 500 }
    );
  }
}