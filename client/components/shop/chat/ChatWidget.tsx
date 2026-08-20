"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Bot, ChevronDown, MessageCircle, Send, X } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@/types/chat.types";
import ReactMarkdown from "react-markdown"; // ✅ 1. Markdown import kiya
import { useGetProfile } from "@/hooks/useAuth";
import { getUserRole } from "@/utils/auth";

const SUGGESTIONS: string[] = [
  // "Which cover is best for Honda Civic 2022?",
  // "How do I pick the right size for my car cover?",
  // "Which product is best for dust + rain protection?",
];

const WELCOME_MESSAGE =
  "Hi! 👋 Welcome to Fancy Store! How can I help you find the perfect car accessories today?";
const MAX_CHARACTERS = 600;

type ChatMessageWithMeta = ChatMessage & {
  id: string;
  createdAt: string;
};

const formatTimestamp = (isoTime: string) =>
  new Date(isoTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const ChatWidget = () => {
  const pathname = usePathname();
  const { data: profileResponse } = useGetProfile();
  const userProfile = profileResponse?.data;
  const [isOpen, setIsOpen] = useState(false);
  const [isOtherChatOpen, setIsOtherChatOpen] = useState(false);
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

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("chatwidget-state", { detail: { isOpen } }));
  }, [isOpen]);

  useEffect(() => {
    const handleOpenChatWidget = () => {
      setIsOpen(true);
    };
    window.addEventListener("open-chatwidget", handleOpenChatWidget);
    return () => window.removeEventListener("open-chatwidget", handleOpenChatWidget);
  }, []);

  const openLiveAgent = () => {
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent("open-livechat"));
  };

  useEffect(() => {
    const handleLiveChatState = (e: Event) => {
      const customEvent = e as CustomEvent<{ isOpen: boolean }>;
      setIsOtherChatOpen(customEvent.detail?.isOpen || false);
    };
    window.addEventListener("livechat-state", handleLiveChatState);
    return () => window.removeEventListener("livechat-state", handleLiveChatState);
  }, []);

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
    } catch (error: any) {
      // Agar backend se rate limit ka error aaye (429) ya custom message ho
      const errorMessage = error.response?.data?.message || "I am facing a temporary issue. Please try again in a moment.";

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: errorMessage, // 👈 Yahan aapka "Agent is busy..." wala message aayega
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

  const isAdminRoute =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  if (isAdminRoute) return null;
  if (!isOpen && isOtherChatOpen) return null;

  return (
    <div className={`fixed z-50 transition-all duration-300 ${isOpen ? "bottom-0 right-0 w-full md:w-auto md:bottom-8 md:right-8" : "bottom-6 right-6"}`}>
      {isOpen ? (
        <div className="w-full h-[85dvh] md:w-[390px] md:h-[calc(100dvh-6rem)] md:max-h-[620px] bg-card border-t md:border border-border/50 rounded-t-2xl md:rounded-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:fade-in md:zoom-in-95 duration-300">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/50 bg-background/90">
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-full bg-primary/10 p-1 flex items-center justify-center border border-primary/20 shadow-sm">
                <img src="/chatbot-icon.svg" alt="AI Chatbot" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-text-main">AI Chatbot Assistant</p>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-xs text-text-muted">Vehicle covers support</p>
              </div>
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

          <div className="flex gap-1 border-b border-border/50 bg-background/60 p-1.5">
            <button type="button" className="flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white" aria-current="page">
              AI Chatbot
            </button>
            <button type="button" onClick={openLiveAgent} className="flex-1 rounded-lg px-3 py-2 text-xs font-semibold text-text-muted transition-colors hover:bg-background hover:text-text-main">
              Live Agent
            </button>
          </div>

          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 bg-background/30 scroll-smooth">
            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={`max-w-[90%] animate-in fade-in slide-in-from-bottom-2 duration-300 ${isUser ? "ml-auto" : "mr-auto"
                    }`}
                >
                  {!isUser ? (
                    <div className="flex items-end gap-2">
                      <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 p-1 border border-primary/20 flex items-center justify-center">
                        <img src="/chatbot-icon.svg" alt="AI Bot" className="w-full h-full object-contain" />
                      </div>
                      <div className="rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm leading-relaxed break-words overflow-hidden bg-background border border-border/50 text-text-main prose prose-sm prose-p:leading-relaxed prose-p:my-1 prose-pre:p-0 max-w-none">
                        <ReactMarkdown
                          components={{
                            a: ({ node, ...props }) => (
                              <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium break-all" />
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                        <p className="mt-1 text-[11px] text-text-muted text-right">
                          {formatTimestamp(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl rounded-br-md px-3.5 py-2.5 text-sm leading-relaxed break-words overflow-hidden bg-primary text-white">
                      <p>{message.content}</p>
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
                  <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 p-1 border border-primary/20 flex items-center justify-center">
                    <img src="/chatbot-icon.svg" alt="AI Bot" className="w-full h-full object-contain" />
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

            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (canSend) handleSend();
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
        <div className="relative">
          <button
            type="button"
            onClick={openChat}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-xl transition-transform duration-300 hover:scale-110 active:scale-95"
            aria-label="Open support chat"
          >
            <MessageCircle className="h-7 w-7" />
          </button>

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-red-500 text-[10px] sm:text-xs font-bold text-white animate-bounce">
              {unreadCount}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;