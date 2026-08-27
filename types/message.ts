export type MessageDirection = "inbound" | "outbound";

export type MessageStatus =
  | "draft"
  | "queued"
  | "sent"
  | "delivered"
  | "failed";

export interface Conversation {
  id: string;

  client_id: string | null;
  lead_id: string | null;

  subject: string;

  participant_email: string;
  participant_name: string | null;

  gmail_thread_id: string | null;

  last_message_at: string;

  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;

  conversation_id: string;

  sender_email: string;
  sender_name: string | null;

  recipient_email: string;
  recipient_name: string | null;

  subject: string;

  body_text: string;
  body_html: string | null;

  direction: MessageDirection;
  status: MessageStatus;

  gmail_message_id: string | null;
  gmail_thread_id: string | null;
  resend_email_id: string | null;

  sent_at: string;
  created_at: string;
}