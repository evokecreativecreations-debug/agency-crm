import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  Conversation,
  Message,
} from "@/types/message";

export async function getConversations(
  supabase: SupabaseClient
): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .order("last_message_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Conversation[];
}

export async function getConversation(
  supabase: SupabaseClient,
  conversationId: string
): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Conversation | null;
}

export async function getMessages(
  supabase: SupabaseClient,
  conversationId: string
): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("sent_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as Message[];
}

export async function createConversation(
  supabase: SupabaseClient,
  conversation: Pick<
    Conversation,
    | "client_id"
    | "lead_id"
    | "subject"
    | "participant_email"
    | "participant_name"
    | "gmail_thread_id"
  >
): Promise<Conversation> {
  const { data, error } = await supabase
    .from("conversations")
    .insert({
      ...conversation,
      last_message_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Conversation;
}

export async function createMessage(
  supabase: SupabaseClient,
  message: Pick<
    Message,
    | "conversation_id"
    | "sender_email"
    | "sender_name"
    | "recipient_email"
    | "recipient_name"
    | "subject"
    | "body_text"
    | "body_html"
    | "direction"
    | "status"
    | "gmail_message_id"
    | "gmail_thread_id"
    | "resend_email_id"
  >
): Promise<Message> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      ...message,
      sent_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Message;
}