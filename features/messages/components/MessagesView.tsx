"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Mail, MessageSquare, Search, Send } from "lucide-react";

import type { Conversation, Message } from "@/types/message";
import { getConversations, getMessages } from "@/features/messages/api";
import { createClient } from "@/lib/supabase/client";

export function MessagesView() {
  const supabase = useMemo(() => createClient(), []);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] =
    useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState("");
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const selectedConversation =
    conversations.find(
      (conversation) => conversation.id === selectedConversationId
    ) ?? null;

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getConversations(supabase);

      setConversations(data);

      if (data.length > 0) {
        setSelectedConversationId((current) => current ?? data[0].id);
      } else {
        setSelectedConversationId(null);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const loadMessages = useCallback(
    async (conversationId: string) => {
      try {
        setMessagesLoading(true);

        const data = await getMessages(supabase, conversationId);

        setMessages(data);
      } catch (error) {
        console.error("Failed to load messages:", error);
        setMessages([]);
      } finally {
        setMessagesLoading(false);
      }
    },
    [supabase]
  );

  useEffect(() => {
  const timer = window.setTimeout(() => {
    void loadConversations();
  }, 0);

  return () => window.clearTimeout(timer);
}, [loadConversations]);

  useEffect(() => {
  if (!selectedConversationId) {
    return;
  }

  const timer = window.setTimeout(() => {
    void loadMessages(selectedConversationId);
  }, 0);

  return () => window.clearTimeout(timer);
}, [selectedConversationId, loadMessages]);

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const subject = conversation.subject?.toLowerCase() ?? "";
      const email = conversation.participant_email?.toLowerCase() ?? "";
      const name = conversation.participant_name?.toLowerCase() ?? "";

      return (
        subject.includes(query) ||
        email.includes(query) ||
        name.includes(query)
      );
    });
  }, [conversations, search]);

  function handleSelectConversation(conversation: Conversation) {
    setSelectedConversationId(conversation.id);
    setMessageText("");
  }

  async function handleSend() {
    const text = messageText.trim();

    if (!text || !selectedConversationId || sending) {
      return;
    }

    try {
      setSending(true);

      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: selectedConversationId,
          bodyText: text,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send message");
      }

      if (result.message) {
        setMessages((current) => [...current, result.message]);
      }

      setMessageText("");

      await loadConversations();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="flex h-[calc(100dvh-7rem)] min-h-[560px] flex-col gap-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate">
          Communication
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
          Messages
        </h1>

        <p className="mt-1 text-sm text-slate">
          Manage client conversations and email history in one place.
        </p>
      </div>

      <div className="grid min-h-0 flex-1 overflow-hidden rounded-lg border border-line bg-surface md:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-b border-line md:border-b-0 md:border-r">
          <div className="border-b border-line p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search conversations"
                className="h-9 w-full rounded-md border border-line bg-paper pl-9 pr-3 text-sm text-ink outline-none placeholder:text-slate focus:border-ink"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-sm text-slate">
                Loading conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <MessageSquare className="mb-3 h-8 w-8 text-slate" />

                <p className="text-sm font-medium text-ink">
                  No conversations
                </p>

                <p className="mt-1 text-xs text-slate">
                  Conversations will appear here once messages are available.
                </p>
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const active =
                  selectedConversationId === conversation.id;

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => handleSelectConversation(conversation)}
                    className={[
                      "flex w-full gap-3 border-b border-line px-4 py-3 text-left transition-colors",
                      active ? "bg-paper" : "hover:bg-paper/70",
                    ].join(" ")}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-paper text-slate">
                      <Mail className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-medium text-ink">
                          {conversation.participant_name ||
                            conversation.participant_email}
                        </p>

                        <span className="shrink-0 text-[10px] text-slate">
                          {formatShortDate(
                            conversation.last_message_at
                          )}
                        </span>
                      </div>

                      <p className="mt-0.5 truncate text-xs font-medium text-ink">
                        {conversation.subject || "(No subject)"}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-slate">
                        {conversation.participant_email}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <div className="flex min-h-0 flex-col">
          {!selectedConversation ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <MessageSquare className="mb-4 h-10 w-10 text-slate" />

              <h2 className="text-sm font-semibold text-ink">
                Select a conversation
              </h2>

              <p className="mt-1 max-w-sm text-xs text-slate">
                Choose a conversation from the left to view its message
                history.
              </p>
            </div>
          ) : (
            <>
              <header className="border-b border-line px-5 py-4">
                <p className="text-sm font-semibold text-ink">
                  {selectedConversation.subject || "(No subject)"}
                </p>

                <p className="mt-1 text-xs text-slate">
                  {selectedConversation.participant_name
                    ? `${selectedConversation.participant_name} · `
                    : ""}
                  {selectedConversation.participant_email}
                </p>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto bg-paper/40 px-5 py-6">
                {messagesLoading ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <Mail className="mb-3 h-8 w-8 text-slate" />

                    <p className="text-sm font-medium text-ink">
                      No messages yet
                    </p>

                    <p className="mt-1 text-xs text-slate">
                      Start the conversation using the reply box below.
                    </p>
                  </div>
                ) : (
                  <div className="mx-auto flex max-w-3xl flex-col gap-4">
                    {messages.map((message) => {
                      const outbound = message.direction === "outbound";

                      return (
                        <div
                          key={message.id}
                          className={[
                            "flex w-full",
                            outbound
                              ? "justify-end"
                              : "justify-start",
                          ].join(" ")}
                        >
                          <div
                            className={[
                              "max-w-[80%] rounded-lg border px-4 py-3 shadow-sm",
                              outbound
                                ? "border-line bg-surface"
                                : "border-line bg-white",
                            ].join(" ")}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-ink">
                                  {message.sender_name ||
                                    message.sender_email}
                                </p>

                                <p className="mt-0.5 text-[10px] text-slate">
                                  {message.sender_email}
                                </p>
                              </div>

                              <p className="shrink-0 text-[10px] text-slate">
                                {formatMessageDate(message.sent_at)}
                              </p>
                            </div>

                            <div className="mt-3">
                              {message.body_html ? (
                                <div
                                  className="break-words text-sm leading-6 text-ink"
                                  dangerouslySetInnerHTML={{
                                    __html: sanitizeEmailHtml(
                                      message.body_html
                                    ),
                                  }}
                                />
                              ) : (
                                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-ink">
                                  {message.body_text || "(No message content)"}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="border-t border-line bg-surface p-4">
                <div className="mx-auto max-w-3xl">
                  <textarea
                    value={messageText}
                    onChange={(event) =>
                      setMessageText(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" &&
                        (event.metaKey || event.ctrlKey)
                      ) {
                        event.preventDefault();
                        void handleSend();
                      }
                    }}
                    placeholder="Write a reply..."
                    rows={3}
                    disabled={sending}
                    className="w-full resize-none rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none placeholder:text-slate focus:border-ink disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <div className="mt-2 flex items-center justify-between gap-4">
                    <p className="text-[11px] text-slate">
                      Press Cmd/Ctrl + Enter to send.
                    </p>

                    <button
                      type="button"
                      onClick={() => void handleSend()}
                      disabled={!messageText.trim() || sending}
                      className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {sending ? "Sending..." : "Send"}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function formatShortDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatMessageDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function sanitizeEmailHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, "")
    .replace(/<embed[\s\S]*?>/gi, "")
    .replace(
      /\son\w+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi,
      ""
    )
    .replace(
      /\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi,
      ""
    );
}