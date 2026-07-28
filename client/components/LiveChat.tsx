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
        <div className={`fixed z-50 font-sans ${isOpen ? "bottom-4 right-4 sm:bottom-6 sm:right-6" : "bottom-[102px] sm:bottom-[136px] md:bottom-[164px] right-4 md:right-8"}`}>
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="h-9 w-9 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-full bg-black hover:bg-gray-800 text-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform duration-300 active:scale-95"
                    aria-label="Open Live Chat Support"
                >
                    <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                </button>
            )}

            {/* Chat Box */}
            {isOpen && (
                <div className="w-[340px] sm:w-[380px] h-[680px] bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">

                    {/* Header */}
                    <div className="bg-black text-white p-4 flex justify-between items-center shadow-md">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                            <div>
                                <h3 className="font-semibold text-sm leading-none">Fancy Store Support</h3>
                                <p className="text-[10px] text-gray-300 mt-1">We usually reply in a few minutes</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-white p-1 rounded-lg transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50">
                        {messages.map((msg) => {
                            const isUser = msg.sender === "user";
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                                >
                                    <div
                                        className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${isUser
                                            ? "bg-black text-white rounded-tr-none"
                                            : "bg-white border border-gray-200 text-gray-800 rounded-tl-none"
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1 px-1">
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
                        className="p-3 bg-white border-t border-gray-100 flex items-center gap-2"
                    >
                        <input
                            type="text"
                            placeholder="Write a message..."
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            className="flex-1 bg-gray-100 text-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black transition"
                        />
                        <button
                            type="submit"
                            disabled={!inputMessage.trim()}
                            className="bg-black hover:bg-gray-800 disabled:opacity-40 text-white p-2.5 rounded-xl transition flex items-center justify-center"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}