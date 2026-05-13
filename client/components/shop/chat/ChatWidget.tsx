"use client";

import React, { useMemo, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@/types/chat.types";

const SUGGESTIONS = [
  "Which cover is best for Honda Civic 2022?",
  "How do I pick the right size for my car cover?",
  "Which product is best for dust + rain protection?",
];

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const { mutateAsync: sendMessage, isPending } = useChat();

  const canSend = useMemo(() => input.trim().length > 0 && !isPending, [input, isPending]);

  const handleSend = async (customText?: string) => {
    const textToSend = (customText ?? input).trim();
    if (!textToSend || isPending) return;

    const updatedMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: textToSend },
    ];

    setMessages(updatedMessages);
    setInput("");

    try {
      const resolvedSessionId = sessionId ?? crypto.randomUUID();
      const response = await sendMessage({
        messages: updatedMessages,
        sessionId: resolvedSessionId,
      });

      if (response.sessionId) {
        setSessionId(response.sessionId);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I am facing a temporary issue. Please try again in a moment.",
        },
      ]);
    }
  };

  return (
    <div className="fixed bottom-14 md:bottom-6 right-4 md:right-6 z-50">
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
              className="p-2 rounded-full bg-card hover:bg-background transition-colors"
              aria-label="Close chat"
            >
              <X size={16} className="text-text-main" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-3.5 bg-background/30">
            {!messages.length && !isPending && (
              <div className="h-full min-h-40 flex items-center justify-center text-center px-4">
                <p className="text-sm text-text-muted">Hi! How can I help you today?</p>
              </div>
            )}
            {messages.map((message, index) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={`${message.role}-${index}`}
                  className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    isUser
                      ? "ml-auto bg-primary text-white rounded-br-md"
                      : "mr-auto bg-background border border-border/50 text-text-main rounded-bl-md"
                  }`}
                >
                  {message.content}
                </div>
              );
            })}
            {isPending && (
              <div className="mr-auto inline-flex items-center gap-1.5 rounded-2xl rounded-bl-md px-3.5 py-2.5 bg-background border border-border/50">
                <span className="h-2 w-2 rounded-full bg-text-muted animate-bounce [animation-delay:-0.24s]" />
                <span className="h-2 w-2 rounded-full bg-text-muted animate-bounce [animation-delay:-0.12s]" />
                <span className="h-2 w-2 rounded-full bg-text-muted animate-bounce" />
              </div>
            )}
          </div>

          <div className="px-3.5 py-3 border-t border-border/50 bg-card">
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

            <div className="flex items-center gap-2.5">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about car covers..."
                className="flex-1 h-11 px-3.5 rounded-xl border border-border/50 bg-background text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
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
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          // ✅ 3. Size classes change ki hain: Mobile pe h-12 w-12 aur Desktop pe md:h-14 md:w-14
          className="h-9 w-9 md:h-24 md:w-24 rounded-full bg-primary text-white shadow-xl flex items-center justify-center hover:scale-105 transition-transform duration-200"
          aria-label="Open chat support"
        >
          {/* ✅ Icon ka size bhi mobile ke liye chota aur PC ke liye bada kar diya */}
          <MessageCircle className="w-5 h-5 md:w-12 md:h-12" />
        </button>
      )}
    </div>
  );
};

export default ChatWidget;
