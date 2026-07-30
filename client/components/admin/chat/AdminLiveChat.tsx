"use client";

import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { ArrowLeft, MessageCircle, Send, UserCircle } from "lucide-react";
import { useGetProfile } from "@/hooks/useAuth";
import { useGetChatRooms } from "@/hooks/useAdmin";
import { ChatRoom } from "@/types/admin.type";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface Message {
  id: string;
  sender: "admin" | "customer";
  text: string;
  time: string;
}

const roomLabel = (room: ChatRoom) => {
  if (room.user?.name) return room.user.name;
  if (room.user?.email) return room.user.email;
  if (room.guestId) return `Guest ${room.guestId.replace("guest_", "").slice(0, 8)}`;
  return "Guest";
};

const formatTime = (date: string | number) =>
  new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function AdminLiveChat() {
  const { data: profile } = useGetProfile();
  const adminId = profile?.data?.id;

  const { data: roomsData, refetch: refetchRooms } = useGetChatRooms();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  const socketRef = useRef<Socket | null>(null);
  const selectedRoomIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    selectedRoomIdRef.current = selectedRoomId;
  }, [selectedRoomId]);

  useEffect(() => {
    if (roomsData?.data) setRooms(roomsData.data);
  }, [roomsData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Connect socket once and join the admin broadcast room so we receive every customer message live
  useEffect(() => {
    const socket = io(BACKEND_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🟢 [ADMIN] Socket Connected:", socket.id);
      socket.emit("join_admin_room");
    });

    socket.on("room_joined", ({ chatRoomId, messages: history }: any) => {
      if (chatRoomId !== selectedRoomIdRef.current) return;
      if (Array.isArray(history)) {
        setMessages(
          history.map((m: any) => ({
            id: m.id,
            sender: m.senderType === "admin" ? "admin" : "customer",
            text: m.message,
            time: formatTime(m.createdAt),
          }))
        );
      }
    });

    socket.on("room_updated", (payload: any) => {
      const { chatRoomId, unreadAdminCount, room: updatedRoom } = payload || {};
      if (!chatRoomId) return;

      setRooms((prev) => {
        const exists = prev.some((r) => r.id === chatRoomId);
        if (!exists) {
          refetchRooms();
          return prev;
        }
        return prev.map((r) => {
          if (r.id === chatRoomId) {
            return {
              ...r,
              ...(updatedRoom || {}),
              unreadAdminCount:
                unreadAdminCount !== undefined ? unreadAdminCount : r.unreadAdminCount,
            };
          }
          return r;
        });
      });
    });

    socket.on("receive_message", (msg: any) => {
      setRooms((prev) => {
        const exists = prev.some((r) => r.id === msg.chatRoomId);
        if (!exists) {
          refetchRooms();
          return prev;
        }
        const next = prev.map((r) =>
          r.id === msg.chatRoomId
            ? {
                ...r,
                lastMessage: msg.message,
                lastMessageAt: msg.createdAt || new Date().toISOString(),
                unreadAdminCount:
                  msg.chatRoomId === selectedRoomIdRef.current
                    ? 0
                    : msg.senderType !== "admin"
                    ? (r.unreadAdminCount || 0) + 1
                    : r.unreadAdminCount,
              }
            : r
        );
        return [...next].sort(
          (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        );
      });

      if (msg.chatRoomId === selectedRoomIdRef.current) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [
            ...prev,
            {
              id: msg.id,
              sender: msg.senderType === "admin" ? "admin" : "customer",
              text: msg.message,
              time: formatTime(msg.createdAt || Date.now()),
            },
          ];
        });
      }
    });

    socket.on("error", (err: any) => {
      console.error("🔴 [ADMIN] Socket Error:", err);
    });

    return () => {
      socket.disconnect();
    };
  }, [refetchRooms]);

  const handleSelectRoom = (room: ChatRoom) => {
    setSelectedRoomId(room.id);
    setMessages([]);
    setRooms((prev) => prev.map((r) => (r.id === room.id ? { ...r, unreadAdminCount: 0 } : r)));
    socketRef.current?.emit("join_room", {
      chatRoomId: room.id,
      userId: adminId,
      userType: "admin",
    });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputMessage.trim();
    if (!text || !selectedRoomId || !socketRef.current || !adminId) return;

    socketRef.current.emit("send_message", {
      chatRoomId: selectedRoomId,
      senderType: "admin",
      senderId: adminId,
      message: text,
      messageType: "text",
    });

    setInputMessage("");
  };

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || null;

  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden h-[calc(100vh-8rem)] flex">
      {/* Rooms List */}
      <div
        className={`w-full md:w-80 shrink-0 border-r border-border/50 flex-col ${
          selectedRoomId ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="p-4 border-b border-border/50">
          <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
            <MessageCircle size={20} className="text-primary" />
            Live Chats
          </h2>
          <p className="text-xs text-text-muted mt-1">{rooms.length} conversations</p>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {rooms.length === 0 && (
            <p className="text-sm text-text-muted p-4">No conversations yet.</p>
          )}
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => handleSelectRoom(room)}
              className={`w-full text-left px-4 py-3 border-b border-border/30 hover:bg-background/80 transition-colors ${
                selectedRoomId === room.id ? "bg-background" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-sm text-text-main truncate">
                  {roomLabel(room)}
                </span>
                {!!room.unreadAdminCount && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                    {room.unreadAdminCount}
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted truncate mt-0.5">
                {room.lastMessage || "No messages yet"}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Panel */}
      <div className={`flex-1 flex-col ${selectedRoomId ? "flex" : "hidden md:flex"}`}>
        {!selectedRoom ? (
          <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
            Select a conversation to start replying
          </div>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-border/50 flex items-center gap-3">
              <button
                onClick={() => setSelectedRoomId(null)}
                className="md:hidden p-1.5 rounded-lg hover:bg-background"
              >
                <ArrowLeft size={18} />
              </button>
              <UserCircle size={28} className="text-primary" />
              <div>
                <p className="font-semibold text-sm text-text-main">{roomLabel(selectedRoom)}</p>
                <p className="text-xs text-text-muted">
                  <span className="capitalize font-medium">{selectedRoom.userType}</span>
                  {selectedRoom.user?.email && <span className="ml-1.5 opacity-80">({selectedRoom.user.email})</span>}
                </p>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-background/30">
              {messages.map((msg) => {
                const isAdmin = msg.sender === "admin";
                return (
                  <div key={msg.id} className={`max-w-[75%] ${isAdmin ? "ml-auto" : "mr-auto"}`}>
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words shadow-sm ${
                        isAdmin
                          ? "bg-primary text-white rounded-br-md"
                          : "bg-card border border-border/50 text-text-main rounded-bl-md"
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

            <form
              onSubmit={handleSend}
              className="p-3 border-t border-border/50 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Type a reply..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 bg-background text-text-main placeholder:text-text-muted border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="bg-primary hover:bg-primary/90 disabled:opacity-40 text-white h-10 w-10 rounded-xl transition flex items-center justify-center shrink-0"
                aria-label="Send reply"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
