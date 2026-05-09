"use client";

import React, { useMemo, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@/service/chatService/chat.service";

const SUGGESTIONS = [
  "Which cover is best for Honda Civic 2022?",
  "How do I pick the right size for my car cover?",
  "Which product is best for dust + rain protection?",
];

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Assalam-o-alaikum! I am your Fancy Store assistant for vehicle covers. Tell me your car make, model, and year so I can recommend the best option.",
    },
  ]);

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
    <div className="fixed bottom-6 right-4 sm:right-6 z-50">
      {isOpen ? (
        <div className="w-[92vw] sm:w-[360px] h-[540px] max-h-[75vh] bg-card border border-border/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background/90">
            <div>
              <p className="text-sm font-semibold text-text-main">Fancy Store Assistant</p>
              <p className="text-xs text-text-muted">Vehicle covers support</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full bg-card hover:bg-background transition-colors"
            >
              <X size={16} className="text-text-main" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-background/30">
            {messages.map((message, index) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={`${message.role}-${index}`}
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    isUser
                      ? "ml-auto bg-primary text-white"
                      : "mr-auto bg-card border border-border/50 text-text-main"
                  }`}
                >
                  {message.content}
                </div>
              );
            })}
            {isPending && (
              <div className="mr-auto max-w-[85%] rounded-2xl px-3 py-2 text-sm bg-card border border-border/50 text-text-muted">
                Thinking...
              </div>
            )}
          </div>

          <div className="px-3 py-2 border-t border-border/50 bg-card">
            <div className="flex flex-wrap gap-2 mb-2">
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

            <div className="flex items-center gap-2">
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
                className="flex-1 h-10 px-3 rounded-xl border border-border/50 bg-background text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!canSend}
                className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center hover:scale-105 transition-transform"
          aria-label="Open chat support"
        >
          <MessageCircle size={24} />
        </button>
      )}
    </div>
  );
};

export default ChatWidget;
