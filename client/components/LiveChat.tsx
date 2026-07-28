"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react"; // Agar Lucide icons install hain

interface Message {
    id: string;
    sender: "user" | "admin";
    text: string;
    time: string;
}

export default function LiveChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [isOtherChatOpen, setIsOtherChatOpen] = useState(false);
    const [inputMessage, setInputMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            sender: "admin",
            text: "Hello! Welcome to Fancy Store. How can we help you today?",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
    ]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        window.dispatchEvent(new CustomEvent("livechat-state", { detail: { isOpen } }));
    }, [isOpen]);

    useEffect(() => {
        const handleChatWidgetState = (e: Event) => {
            const customEvent = e as CustomEvent<{ isOpen: boolean }>;
            setIsOtherChatOpen(customEvent.detail?.isOpen || false);
        };
        window.addEventListener("chatwidget-state", handleChatWidgetState);
        return () => window.removeEventListener("chatwidget-state", handleChatWidgetState);
    }, []);

    // Auto-scroll to bottom when new message arrives
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Local send message handler (Dummy logic for now)
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            sender: "user",
            text: inputMessage,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputMessage("");
    };

    if (!isOpen && isOtherChatOpen) return null;

    return (
        <div className={`fixed z-50 transition-all duration-300 ${isOpen ? "bottom-0 right-0 w-full md:w-auto md:bottom-8 md:right-8" : "bottom-[102px] sm:bottom-[136px] md:bottom-[164px] right-4 md:right-8"}`}>
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="h-9 w-9 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform duration-300 active:scale-95"
                    aria-label="Open Live Chat Support"
                >
                    <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                </button>
            )}

            {/* Chat Box */}
            {isOpen && (
                <div className="w-full h-[85dvh] md:w-[390px] md:h-[calc(100dvh-6rem)] md:max-h-[620px] bg-card border-t md:border border-border/50 rounded-t-2xl md:rounded-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:fade-in md:zoom-in-95 duration-300">

                    {/* Header */}
                    <div className="px-4 py-3.5 border-b border-border/50 bg-background/90 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-sm">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <h3 className="font-semibold text-sm leading-none text-text-main">Fancy Store Support</h3>
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                </div>
                                <p className="text-xs text-text-muted mt-1">We usually reply in a few minutes</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="h-10 w-10 flex items-center justify-center rounded-full bg-card hover:bg-background transition-all hover:scale-105"
                            aria-label="Close live chat"
                        >
                            <X className="w-5 h-5 text-text-main" />
                        </button>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-background/30 scroll-smooth">
                        {messages.map((msg) => {
                            const isUser = msg.sender === "user";
                            return (
                                <div
                                    key={msg.id}
                                    className={`max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300 ${isUser ? "ml-auto" : "mr-auto"}`}
                                >
                                    <div
                                        className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words shadow-sm ${isUser
                                            ? "bg-primary text-white rounded-br-md"
                                            : "bg-background border border-border/50 text-text-main rounded-bl-md"
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                    <span className="text-[10px] text-text-muted mt-1 px-1 block text-right">
                                        {msg.time}
                                    </span>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Form */}
                    <form
                        onSubmit={handleSendMessage}
                        className="p-3 bg-card border-t border-border/50 flex items-center gap-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
                    >
                        <input
                            type="text"
                            placeholder="Write a message..."
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            className="flex-1 bg-background text-text-main placeholder:text-text-muted border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                        />
                        <button
                            type="submit"
                            disabled={!inputMessage.trim()}
                            className="bg-primary hover:bg-primary/90 disabled:opacity-40 text-white h-10 w-10 rounded-xl transition flex items-center justify-center shrink-0"
                            aria-label="Send message"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}