"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bot, ChevronDown, MessageCircle, Send, X } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@/types/chat.types";

const SUGGESTIONS = [
  "Which cover is best for Honda Civic 2022?",
  "How do I pick the right size for my car cover?",
  "Which product is best for dust + rain protection?",
];

const WELCOME_MESSAGE =
  "Hi! 👋 Welcome to Fancy Store! How can I help you find the perfect car cover today?";
const MAX_CHARACTERS = 600;

type ChatMessageWithMeta = ChatMessage & {
  id: string;
  createdAt: string;
};

const formatTimestamp = (isoTime: string) =>
  new Date(isoTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageWithMeta[]>([]);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const { mutateAsync: sendMessage, isPending } = useChat();

  const canSend = useMemo(
    () => input.trim().length > 0 && !isPending && input.length <= MAX_CHARACTERS,
    [input, isPending]
  );

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || isOpen) return;
    if (lastMessage.role === "assistant") {
      setUnreadCount((prev) => prev + 1);
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (isNearBottom) {
      scrollToBottom("smooth");
    } else {
      setShowScrollToBottom(true);
    }
  }, [messages, isOpen, isNearBottom]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const updateScrollState = () => {
      const distanceToBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      const nearBottom = distanceToBottom < 100;
      setIsNearBottom(nearBottom);
      setShowScrollToBottom(!nearBottom);
    };

    updateScrollState();
    container.addEventListener("scroll", updateScrollState);
    return () => container.removeEventListener("scroll", updateScrollState);
  }, [isOpen]);

  const handleSend = async (customText?: string) => {
    const textToSend = (customText ?? input).trim();
    if (!textToSend || isPending) return;

    const updatedMessages: ChatMessageWithMeta[] = [
      ...messages,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: textToSend,
        createdAt: new Date().toISOString(),
      },
    ];

    setMessages(updatedMessages);
    setInput("");

    try {
      const resolvedSessionId = sessionId ?? crypto.randomUUID();
      const response = await sendMessage({
        messages: updatedMessages.map(({ role, content }) => ({ role, content })),
        sessionId: resolvedSessionId,
      });

      if (response.sessionId) {
        setSessionId(response.sessionId);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: response.reply,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "I am facing a temporary issue. Please try again in a moment.",
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  };

  const openChat = () => {
    setIsOpen(true);
    if (!hasOpenedOnce) {
      setHasOpenedOnce(true);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: WELCOME_MESSAGE,
          createdAt: new Date().toISOString(),
        },
      ]);
      setUnreadCount(0);
      return;
    }
    setUnreadCount(0);
  };

  return (
    <div className="fixed bottom-14 md:bottom-8 right-4 md:right-8 z-50">
      {isOpen ? (
       <div className="w-[calc(100vw-2rem)] h-[calc(100dvh-7rem)] max-h-[700px] md:w-[390px] md:h-[620px] bg-card border border-border/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/50 bg-background/90">
            <div>
              <p className="text-sm font-semibold text-text-main">Fancy Store Assistant</p>
              <p className="text-xs text-text-muted">Vehicle covers support</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="h-10 w-10 flex items-center justify-center rounded-full bg-card hover:bg-background transition-all hover:scale-105"
              aria-label="Close chat"
            >
              <X size={18} className="text-text-main" />
            </button>
          </div>

          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 bg-background/30 scroll-smooth">
            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={`max-w-[90%] animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                    isUser ? "ml-auto" : "mr-auto"
                  }`}
                >
                  {!isUser ? (
                    <div className="flex items-end gap-2">
                      <div className="h-7 w-7 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <Bot size={14} />
                      </div>
                      <div className="rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm leading-relaxed wrap-break-word overflow-hidden bg-background border border-border/50 text-text-main">
                        {message.content}
                        <p className="mt-1 text-[11px] text-text-muted">
                          {formatTimestamp(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl rounded-br-md px-3.5 py-2.5 text-sm leading-relaxed wrap-break-word overflow-hidden bg-primary text-white">
                      {message.content}
                      <p className="mt-1 text-[11px] text-white/80 text-right">
                        {formatTimestamp(message.createdAt)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
            {isPending && (
              <div className="mr-auto max-w-[90%] animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-end gap-2">
                  <div className="h-7 w-7 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Bot size={14} />
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-bl-md px-3.5 py-3 bg-background border border-border/50">
                    <span className="h-2 w-2 rounded-full bg-text-muted animate-bounce [animation-delay:-0.24s]" />
                    <span className="h-2 w-2 rounded-full bg-text-muted animate-bounce [animation-delay:-0.12s]" />
                    <span className="h-2 w-2 rounded-full bg-text-muted animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {showScrollToBottom && (
            <button
              type="button"
              onClick={() => {
                scrollToBottom("smooth");
                setShowScrollToBottom(false);
              }}
              className="absolute bottom-24 right-4 h-9 w-9 rounded-full border border-border/50 bg-card text-text-main shadow-md flex items-center justify-center hover:bg-background transition-colors"
              aria-label="Scroll to bottom"
            >
              <ChevronDown size={18} />
            </button>
          )}

          <div className="sticky bottom-0 px-4 py-3 pb-[max(0.875rem,env(safe-area-inset-bottom))] border-t border-border/50 bg-card">
            <div className="flex flex-wrap gap-2 mb-3">
              {SUGGESTIONS.slice(0, 2).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSend(suggestion)}
                  disabled={isPending}
                  className="text-xs px-2.5 py-1.5 rounded-full bg-background border border-border/50 text-text-muted hover:text-text-main transition-colors disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="flex items-end gap-2.5">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARACTERS))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about car covers..."
                rows={1}
                className="flex-1 min-h-11 max-h-28 resize-none px-3.5 py-3 rounded-xl border border-border/50 bg-background text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!canSend}
                className="h-11 w-11 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                aria-label="Send message"
              >
                <Send size={17} />
              </button>
            </div>
            <div className="mt-1.5 text-right text-[11px] text-text-muted">
              {input.length}/{MAX_CHARACTERS}
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          // ✅ Size classes unified with WhatsAppWidget for a symmetric look
          className="h-9 w-9 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform duration-300"
          aria-label="Open chat support"
        >
          {/* ✅ Icon dynamically scales across screens to match WhatsApp */}
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
        </button>
      )}
    </div>
  );
};

export default ChatWidget;
