"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send } from "lucide-react"; // Agar Lucide icons install hain
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { useGetProfile } from "@/hooks/useAuth";
import { getUserRole } from "@/utils/auth";
// import console from "console";

// Aap ke backend ka URL (Apne env variable ke mutabiq adjust karein)
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;


import api from "@/service/api";

interface Message {
    id: string;
    sender: "user" | "admin";
    text: string;
    time: string;
}

interface LiveChatProps {
    user?: {
        id: string | number;
        name?: string;
        email?: string;
    } | null;
}

let socket: Socket;


const addOrReplaceMessage = (prev: Message[], newMsg: Message): Message[] => {
    if (prev.some((m) => m.id === newMsg.id)) {
        return prev;
    }
    const tempIndex = prev.findIndex(
        (m) => m.sender === newMsg.sender && m.text.trim() === newMsg.text.trim()
    );
    if (tempIndex !== -1) {
        const updated = [...prev];
        updated[tempIndex] = newMsg;
        return updated;
    }
    return [...prev, newMsg];
};

export default function LiveChat({ user: userProp }: LiveChatProps = {}) {
    const pathname = usePathname();
    const { data: profileResponse } = useGetProfile();
    const userProfile = profileResponse?.data;
    const currentUser = userProp || (userProfile ? { id: userProfile.id, name: userProfile.name, email: userProfile.email } : null);

    const [isOpen, setIsOpen] = useState(false);
    const [isOtherChatOpen, setIsOtherChatOpen] = useState(false);
    const [inputMessage, setInputMessage] = useState("");
    const [chatRoomId, setChatRoomId] = useState<string | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [messages, setMessages] = useState<Message[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isOpenRef = useRef(isOpen);
    const chatRoomIdRef = useRef<string | null>(chatRoomId);

    useEffect(() => {
        isOpenRef.current = isOpen;
    }, [isOpen]);

    useEffect(() => {
        chatRoomIdRef.current = chatRoomId;
    }, [chatRoomId]);

    // 1. Guest ID Manage (sessionStorage se per-tab isolation)
    const getGuestId = () => {
        if (typeof window === "undefined") return "";
        let gId = sessionStorage.getItem("fancy_guest_id");
        if (!gId || gId === "undefined" || gId === "null" || gId.trim() === "" || gId.length < 5) {
            gId = `guest_${uuidv4()}`;
            sessionStorage.setItem("fancy_guest_id", gId);
        }
        return gId;
    };

    const guestId = getGuestId();
    const userId = currentUser?.id ? String(currentUser.id) : null;
    const userType = currentUser ? "registered" : "guest";
    const senderId = currentUser ? String(currentUser.id) : guestId;

    const [isAdminTyping, setIsAdminTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // HTTP Join Room (Ensures instant room assignment on Vercel)
    useEffect(() => {
        let isMounted = true;
        const joinRoomHttp = async () => {
            try {
                const res = await api.post("/chat/live/join", {
                    userId,
                    guestId,
                    userType,
                });
                const data = res.data?.data;
                if (data?.chatRoomId && isMounted) {
                    setChatRoomId(data.chatRoomId);
                    chatRoomIdRef.current = data.chatRoomId;
                    sessionStorage.setItem("fancy_chat_room_id", data.chatRoomId);

                    if (data.room?.unreadUserCount && !isOpenRef.current) {
                        setUnreadCount(data.room.unreadUserCount);
                    }

                    if (Array.isArray(data.messages)) {
                        setMessages((prev) => {
                            let updated = [...prev];
                            data.messages.forEach((m: any) => {
                                const formatted: Message = {
                                    id: String(m.id),
                                    sender: m.senderType === "admin" ? "admin" : "user",
                                    text: m.message,
                                    time: new Date(m.createdAt).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    }),
                                };
                                updated = addOrReplaceMessage(updated, formatted);
                            });
                            return updated;
                        });
                    }
                }
            } catch (err) {
                console.error("LiveChat HTTP join error:", err);
            }
        };

        joinRoomHttp();
        return () => {
            isMounted = false;
        };
    }, [userId, guestId, userType]);

    // Background HTTP Sync (Every 3 seconds when chat box is open)
    useEffect(() => {
        if (!isOpen) return;
        const activeRoomId = chatRoomId || chatRoomIdRef.current || sessionStorage.getItem("fancy_chat_room_id");
        if (!activeRoomId) return;

        const interval = setInterval(async () => {
            try {
                const res = await api.get(`/chat/live/messages?chatRoomId=${activeRoomId}`);
                const serverMessages = res.data?.data;
                if (Array.isArray(serverMessages)) {
                    setMessages((prev) => {
                        let updated = [...prev];
                        serverMessages.forEach((m: any) => {
                            const formatted: Message = {
                                id: String(m.id),
                                sender: m.senderType === "admin" ? "admin" : "user",
                                text: m.message,
                                time: new Date(m.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                }),
                            };
                            updated = addOrReplaceMessage(updated, formatted);
                        });
                        return updated;
                    });
                }
            } catch (err) {
                // Silent catch
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [isOpen, chatRoomId]);

    useEffect(() => {
        window.dispatchEvent(new CustomEvent("livechat-state", { detail: { isOpen } }));
    }, [isOpen]);

    useEffect(() => {
        const handleOpenLiveChat = () => {
            setIsOpen(true);
        };
        window.addEventListener("open-livechat", handleOpenLiveChat);
        return () => window.removeEventListener("open-livechat", handleOpenLiveChat);
    }, []);

    const openAiChat = () => {
        setIsOpen(false);
        window.dispatchEvent(new CustomEvent("open-chatwidget"));
    };

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

    // Clear unread count when chat opens
    useEffect(() => {
        if (isOpen) {
            setUnreadCount(0);
            const activeRoomId = chatRoomId || sessionStorage.getItem("fancy_chat_room_id");
            if (activeRoomId) {
                api.post("/chat/live/mark-read", { chatRoomId: activeRoomId, userType: currentUser ? "user" : "guest" }).catch(() => null);
            }
            if (socket && activeRoomId) {
                socket.emit("mark_read", { chatRoomId: activeRoomId, userType: currentUser ? "user" : "guest" });
            }
        }
    }, [isOpen, chatRoomId, currentUser]);

    // Initialize Socket connection immediately on mount so user receives real-time admin messages & badge alerts
    useEffect(() => {
        if (!BACKEND_URL) return;
        try {
            socket = io(BACKEND_URL, {
                withCredentials: true,
                transports: ["polling", "websocket"],
            });

            socket.on("connect", () => {
                console.log("🟢 [CLIENT] Socket Connected Successfully! ID:", socket.id);
                socket.emit("join_room", {
                    userId,
                    guestId,
                    userType,
                });
            });

            socket.on("connect_error", (err) => {
                console.error("🔴 [CLIENT] Connection Error:", err.message);
            });

            socket.on("room_joined", ({ chatRoomId: assignedRoomId, room: roomData, messages: serverMessages }: any) => {
                setChatRoomId(assignedRoomId);
                chatRoomIdRef.current = assignedRoomId;
                sessionStorage.setItem("fancy_chat_room_id", assignedRoomId);

                if (roomData?.unreadUserCount && !isOpenRef.current) {
                    setUnreadCount(roomData.unreadUserCount);
                }

                if (Array.isArray(serverMessages)) {
                    setMessages((prev) => {
                        let updated = [...prev];
                        serverMessages.forEach((m: any) => {
                            const formatted: Message = {
                                id: String(m.id),
                                sender: m.senderType === "admin" ? "admin" : "user",
                                text: m.message,
                                time: new Date(m.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                }),
                            };
                            updated = addOrReplaceMessage(updated, formatted);
                        });
                        return updated;
                    });
                }
            });

            socket.on("receive_message", (newMessageData: any) => {
                const currentRoomId = chatRoomIdRef.current || sessionStorage.getItem("fancy_chat_room_id");
                if (!currentRoomId || newMessageData.chatRoomId !== currentRoomId) {
                    return;
                }

                const formattedMessage: Message = {
                    id: String(newMessageData.id || Date.now()),
                    sender: newMessageData.senderType === "admin" ? "admin" : "user",
                    text: newMessageData.message,
                    time: new Date(newMessageData.createdAt || Date.now()).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                };

                setMessages((prev) => addOrReplaceMessage(prev, formattedMessage));

                if (newMessageData.senderType === "admin") {
                    if (!isOpenRef.current) {
                        setUnreadCount((prev) => prev + 1);
                    } else {
                        if (socket && currentRoomId) {
                            socket.emit("mark_read", { chatRoomId: currentRoomId, userType: currentUser ? "user" : "guest" });
                        }
                    }
                }
            });

            socket.on("user_typing", (data: any) => {
                const currentRoomId = chatRoomIdRef.current || sessionStorage.getItem("fancy_chat_room_id");
                if (data.chatRoomId === currentRoomId && data.senderType === "admin") {
                    setIsAdminTyping(data.isTyping);
                }
            });

            return () => {
                if (socket) socket.disconnect();
            };
        } catch (err) {
            console.error("Socket initialization error:", err);
        }
    }, [userId, guestId, userType]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputMessage(val);

        const activeRoomId = chatRoomId || chatRoomIdRef.current || sessionStorage.getItem("fancy_chat_room_id");
        if (socket && activeRoomId) {
            const senderType = currentUser ? "user" : "guest";
            if (val.trim()) {
                socket.emit("typing_start", { chatRoomId: activeRoomId, senderType });
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => {
                    socket.emit("typing_stop", { chatRoomId: activeRoomId, senderType });
                }, 2000);
            } else {
                socket.emit("typing_stop", { chatRoomId: activeRoomId, senderType });
            }
        }
    };

    // Dual HTTP + Socket send message handler
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = inputMessage.trim();
        if (!text) return;

        const activeRoomId = chatRoomId || chatRoomIdRef.current || sessionStorage.getItem("fancy_chat_room_id");
        const senderType = currentUser ? "user" : "guest";

        const tempMessage: Message = {
            id: String(Date.now()),
            sender: "user",
            text,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => addOrReplaceMessage(prev, tempMessage));
        setInputMessage("");

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        if (socket && activeRoomId) {
            socket.emit("typing_stop", { chatRoomId: activeRoomId, senderType });
        }

        const payload = {
            chatRoomId: activeRoomId,
            senderType,
            senderId,
            message: text,
            messageType: "text",
        };

        if (socket && socket.connected && activeRoomId) {
            socket.emit("send_message", payload);
        } else {
            try {
                const res = await api.post("/chat/live/send", payload);
                const data = res.data?.data;
                if (data?.message?.id) {
                    const serverMsg: Message = {
                        id: String(data.message.id),
                        sender: "user",
                        text: data.message.message,
                        time: new Date(data.message.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    };
                    setMessages((prev) => addOrReplaceMessage(prev, serverMsg));
                }
                if (data?.chatRoomId && !activeRoomId) {
                    setChatRoomId(data.chatRoomId);
                    chatRoomIdRef.current = data.chatRoomId;
                    sessionStorage.setItem("fancy_chat_room_id", data.chatRoomId);
                }
            } catch (err) {
                console.error("LiveChat HTTP send error:", err);
            }
        }
    };

    const isAdminRoute =
        pathname === "/dashboard" ||
        pathname.startsWith("/dashboard/") ||
        pathname === "/admin" ||
        pathname.startsWith("/admin/");

    if (isAdminRoute) return null;
    if (!isOpen) return null;

    return (
        <div className={`fixed z-50 transition-all duration-300 ${isOpen ? "bottom-0 right-0 w-full md:w-auto md:bottom-8 md:right-8" : "bottom-[102px] sm:bottom-[136px] md:bottom-[164px] right-4 md:right-8"}`}>
            {/* Toggle Button */}
            {!isOpen && (
                <div className="relative">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="h-9 w-9 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform duration-300 active:scale-95"
                        aria-label="Open Live Chat Support"
                    >
                        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                    </button>

                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-red-500 text-[10px] sm:text-xs font-bold text-white animate-bounce shadow-lg ring-2 ring-background z-10">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </div>
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

                    <div className="flex gap-1 border-b border-border/50 bg-background/60 p-1.5">
                        <button type="button" onClick={openAiChat} className="flex-1 rounded-lg px-3 py-2 text-xs font-semibold text-text-muted transition-colors hover:bg-background hover:text-text-main">
                            AI Chatbot
                        </button>
                        <button type="button" className="flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white" aria-current="page">
                            Live Agent
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
                        {isAdminTyping && (
                            <div className="mr-auto max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="px-4 py-2.5 rounded-2xl rounded-bl-md bg-background border border-border/50 text-text-main text-xs flex items-center gap-2 shadow-sm">
                                    <span className="font-medium text-primary">Support Agent is typing</span>
                                    <span className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                                    </span>
                                </div>
                            </div>
                        )}
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
                            onChange={handleInputChange}
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