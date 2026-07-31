"use client";

import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { ArrowLeft, MessageCircle, Send, Trash2, UserCircle } from "lucide-react";
import { useGetProfile } from "@/hooks/useAuth";
import { useDeleteChatRoom, useGetChatRooms } from "@/hooks/useAdmin";
import { ChatRoom } from "@/types/admin.type";

import api from "@/service/api";

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

const addOrReplaceAdminMessage = (prev: Message[], newMsg: Message): Message[] => {
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

export default function AdminLiveChat() {
  const { data: profile } = useGetProfile();
  const adminId = profile?.data?.id;

  const { data: roomsData, refetch: refetchRooms } = useGetChatRooms();
  const { mutate: deleteRoom, isPending: isDeleting } = useDeleteChatRoom();

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [onlineRoomIds, setOnlineRoomIds] = useState<string[]>([]);
  const [typingRoomIds, setTypingRoomIds] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const selectedRoomIdRef = useRef<string | null>(selectedRoomId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleDeleteRoom = (roomId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this chat conversation?")) {
      deleteRoom(roomId, {
        onSuccess: () => {
          setRooms((prev) => prev.filter((r) => r.id !== roomId));
          if (selectedRoomId === roomId) {
            setSelectedRoomId(null);
            setMessages([]);
          }
        },
      });
    }
  };

  useEffect(() => {
    selectedRoomIdRef.current = selectedRoomId;
  }, [selectedRoomId]);

  useEffect(() => {
    if (roomsData?.data) setRooms(roomsData.data);
  }, [roomsData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3s Background HTTP Sync for Admin (Guarantees fresh rooms and messages on Vercel)
  useEffect(() => {
    const interval = setInterval(() => {
      refetchRooms();
      if (selectedRoomIdRef.current) {
        api.get(`/admin/chat/rooms/${selectedRoomIdRef.current}/messages`)
          .then((res) => {
            if (Array.isArray(res.data?.data)) {
              setMessages((prev) => {
                let updated = [...prev];
                res.data.data.forEach((m: any) => {
                  const formatted: Message = {
                    id: String(m.id),
                    sender: m.senderType === "admin" ? "admin" : "customer",
                    text: m.message,
                    time: formatTime(m.createdAt),
                  };
                  updated = addOrReplaceAdminMessage(updated, formatted);
                });
                return updated;
              });
            }
          })
          .catch(() => null);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [refetchRooms]);

  // Connect socket once and join the admin broadcast room so we receive every customer message live
  useEffect(() => {
    if (!BACKEND_URL) return;
    try {
      const socket = io(BACKEND_URL, {
        withCredentials: true,
        transports: ["polling", "websocket"],
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("🟢 [ADMIN] Socket Connected:", socket.id);
        socket.emit("join_admin_room");
      });

      socket.on("online_users_list", ({ onlineRoomIds: ids }: { onlineRoomIds: string[] }) => {
        if (Array.isArray(ids)) {
          setOnlineRoomIds(ids);
        }
      });

      socket.on("user_status_changed", ({ chatRoomId, isOnline }: { chatRoomId: string; isOnline: boolean }) => {
        setOnlineRoomIds((prev) => {
          if (isOnline) {
            return prev.includes(chatRoomId) ? prev : [...prev, chatRoomId];
          } else {
            return prev.filter((id) => id !== chatRoomId);
          }
        });
      });

      socket.on("user_typing", ({ chatRoomId, senderType, isTyping }: { chatRoomId: string; senderType: string; isTyping: boolean }) => {
        if (senderType !== "admin") {
          setTypingRoomIds((prev) => {
            if (isTyping) {
              return prev.includes(chatRoomId) ? prev : [...prev, chatRoomId];
            } else {
              return prev.filter((id) => id !== chatRoomId);
            }
          });
        }
      });

      socket.on("room_joined", ({ chatRoomId, messages: history }: any) => {
        if (chatRoomId !== selectedRoomIdRef.current) return;
        if (Array.isArray(history)) {
          setMessages((prev) => {
            let updated = [...prev];
            history.forEach((m: any) => {
              const formatted: Message = {
                id: String(m.id),
                sender: m.senderType === "admin" ? "admin" : "customer",
                text: m.message,
                time: formatTime(m.createdAt),
              };
              updated = addOrReplaceAdminMessage(updated, formatted);
            });
            return updated;
          });
        }
      });

      socket.on("room_updated", (payload: any) => {
        const { chatRoomId, unreadAdminCount, room: updatedRoom, lastMessage, lastMessageAt, senderType } = payload || {};
        if (!chatRoomId) return;

        setRooms((prev) => {
          const exists = prev.some((r) => r.id === chatRoomId);
          if (!exists) {
            refetchRooms();
            if (updatedRoom) {
              const isSelected = chatRoomId === selectedRoomIdRef.current;
              const newUnread = isSelected ? 0 : (updatedRoom.unreadAdminCount ?? 1);
              return [{ ...updatedRoom, unreadAdminCount: newUnread }, ...prev];
            }
            return prev;
          }

          const next = prev.map((r) => {
            if (r.id === chatRoomId) {
              const isSelected = chatRoomId === selectedRoomIdRef.current;
              let targetUnread = r.unreadAdminCount || 0;

              if (isSelected) {
                targetUnread = 0;
              } else if (unreadAdminCount !== undefined) {
                targetUnread = unreadAdminCount;
              } else if (updatedRoom?.unreadAdminCount !== undefined) {
                targetUnread = updatedRoom.unreadAdminCount;
              } else if (senderType !== "admin" && senderType !== undefined) {
                targetUnread = (r.unreadAdminCount || 0) + 1;
              }

              return {
                ...r,
                ...(updatedRoom || {}),
                lastMessage: lastMessage || updatedRoom?.lastMessage || r.lastMessage,
                lastMessageAt: lastMessageAt || updatedRoom?.lastMessageAt || r.lastMessageAt || new Date().toISOString(),
                unreadAdminCount: targetUnread,
              };
            }
            return r;
          });

          return [...next].sort(
            (a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()
          );
        });
      });

      socket.on("receive_message", (msg: any) => {
        setRooms((prev) => {
          const exists = prev.some((r) => r.id === msg.chatRoomId);
          if (!exists) {
            refetchRooms();
          }

          const isSelected = msg.chatRoomId === selectedRoomIdRef.current;

          const next = exists
            ? prev.map((r) =>
              r.id === msg.chatRoomId
                ? {
                  ...r,
                  lastMessage: msg.message,
                  lastMessageAt: msg.createdAt || new Date().toISOString(),
                  unreadAdminCount:
                    isSelected
                      ? 0
                      : msg.senderType !== "admin"
                        ? (r.unreadAdminCount || 0) + 1
                        : r.unreadAdminCount,
                }
                : r
            )
            : [
              {
                id: msg.chatRoomId,
                userId: msg.senderType !== "guest" && !isNaN(Number(msg.senderId)) ? Number(msg.senderId) : null,
                guestId: msg.senderType === "guest" ? msg.senderId : null,
                userType: msg.senderType === "guest" ? "guest" : "registered",
                lastMessage: msg.message,
                lastMessageAt: msg.createdAt || new Date().toISOString(),
                unreadAdminCount: isSelected ? 0 : 1,
                unreadUserCount: 0,
                status: "active",
                user: msg.room?.user || null,
              } as ChatRoom,
              ...prev,
            ];

          return [...next].sort(
            (a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()
          );
        });

        if (msg.chatRoomId === selectedRoomIdRef.current) {
          const formatted: Message = {
            id: String(msg.id),
            sender: msg.senderType === "admin" ? "admin" : "customer",
            text: msg.message,
            time: formatTime(msg.createdAt || Date.now()),
          };
          setMessages((prev) => addOrReplaceAdminMessage(prev, formatted));
          socketRef.current?.emit("mark_read", { chatRoomId: msg.chatRoomId, userType: "admin" });
        }
      });

      socket.on("error", (err: any) => {
        console.error("🔴 [ADMIN] Socket Error:", err);
      });

      return () => {
        socket.disconnect();
      };
    } catch (err) {
      console.error("Admin socket initialization error:", err);
    }
  }, [refetchRooms]);

  const handleSelectRoom = async (room: ChatRoom) => {
    setSelectedRoomId(room.id);
    setMessages([]);
    setRooms((prev) => prev.map((r) => (r.id === room.id ? { ...r, unreadAdminCount: 0 } : r)));

    api.post("/chat/live/mark-read", { chatRoomId: room.id, userType: "admin" }).catch(() => null);

    if (socketRef.current) {
      socketRef.current.emit("join_room", {
        chatRoomId: room.id,
        userId: adminId,
        userType: "admin",
      });
    }

    try {
      const res = await api.get(`/admin/chat/rooms/${room.id}/messages`);
      const serverMsgs = res.data?.data;
      if (Array.isArray(serverMsgs)) {
        setMessages((prev) => {
          let updated = [...prev];
          serverMsgs.forEach((m: any) => {
            const formatted: Message = {
              id: String(m.id),
              sender: m.senderType === "admin" ? "admin" : "customer",
              text: m.message,
              time: formatTime(m.createdAt),
            };
            updated = addOrReplaceAdminMessage(updated, formatted);
          });
          return updated;
        });
      }
    } catch (err) {
      console.error("Admin HTTP load room messages error:", err);
    }
  };

  const handleAdminInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputMessage(val);

    if (socketRef.current && selectedRoomId) {
      if (val.trim()) {
        socketRef.current.emit("typing_start", { chatRoomId: selectedRoomId, senderType: "admin" });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          socketRef.current?.emit("typing_stop", { chatRoomId: selectedRoomId, senderType: "admin" });
        }, 2000);
      } else {
        socketRef.current.emit("typing_stop", { chatRoomId: selectedRoomId, senderType: "admin" });
      }
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputMessage.trim();
    if (!text || !selectedRoomId || !adminId) return;

    const tempMsg: Message = {
      id: String(Date.now()),
      sender: "admin",
      text,
      time: formatTime(Date.now()),
    };

    setMessages((prev) => addOrReplaceAdminMessage(prev, tempMsg));
    setInputMessage("");

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (socketRef.current) {
      socketRef.current.emit("typing_stop", { chatRoomId: selectedRoomId, senderType: "admin" });
    }

    const payload = {
      chatRoomId: selectedRoomId,
      senderType: "admin",
      senderId: String(adminId),
      message: text,
      messageType: "text",
    };

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("send_message", payload);
    } else {
      try {
        const res = await api.post("/chat/live/send", payload);
        const data = res.data?.data;
        if (data?.message?.id) {
          const serverMsg: Message = {
            id: String(data.message.id),
            sender: "admin",
            text: data.message.message,
            time: formatTime(data.message.createdAt || Date.now()),
          };
          setMessages((prev) => addOrReplaceAdminMessage(prev, serverMsg));
        }
      } catch (err) {
        console.error("Admin HTTP send error:", err);
      }
    }
  };

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || null;

  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden h-[calc(100vh-8rem)] flex">
      {/* Rooms List */}
      <div
        className={`w-full md:w-80 shrink-0 border-r border-border/50 flex-col ${selectedRoomId ? "hidden md:flex" : "flex"
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
          {rooms.map((room) => {
            const isUserOnline = onlineRoomIds.includes(room.id);
            const isUserTyping = typingRoomIds.includes(room.id);
            return (
              <div
                key={room.id}
                onClick={() => handleSelectRoom(room)}
                className={`group relative w-full text-left px-4 py-3 border-b border-border/30 hover:bg-background/80 transition-colors cursor-pointer ${selectedRoomId === room.id ? "bg-background" : ""
                  }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm text-text-main truncate flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 transition-all ${isUserOnline
                          ? "bg-emerald-500 ring-2 ring-emerald-500/20 animate-pulse"
                          : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      title={isUserOnline ? "Online on website" : "Offline"}
                    />
                    {roomLabel(room)}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!!room.unreadAdminCount && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {room.unreadAdminCount}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteRoom(room.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-all"
                      title="Delete Chat"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-text-muted truncate mt-0.5 pr-6">
                  {isUserTyping ? (
                    <span className="text-primary font-medium italic animate-pulse">typing...</span>
                  ) : (
                    room.lastMessage || "No messages yet"
                  )}
                </p>
              </div>
            );
          })}
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
            <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedRoomId(null)}
                  className="md:hidden p-1.5 rounded-lg hover:bg-background"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="relative">
                  <UserCircle size={28} className="text-primary" />
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card ${onlineRoomIds.includes(selectedRoom.id) ? "bg-emerald-500" : "bg-gray-300"
                      }`}
                  />
                </div>
                <div>
                  <p className="font-semibold text-sm text-text-main flex items-center gap-1.5">
                    {roomLabel(selectedRoom)}
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${onlineRoomIds.includes(selectedRoom.id)
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                    >
                      {onlineRoomIds.includes(selectedRoom.id) ? "Online" : "Offline"}
                    </span>
                  </p>
                  <p className="text-xs text-text-muted">
                    <span className="capitalize font-medium">{selectedRoom.userType}</span>
                    {selectedRoom.user?.email && <span className="ml-1.5 opacity-80">({selectedRoom.user.email})</span>}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteRoom(selectedRoom.id)}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 text-xs font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <Trash2 size={15} />
                <span>Delete Chat</span>
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-background/30">
              {messages.map((msg) => {
                const isAdmin = msg.sender === "admin";
                return (
                  <div key={msg.id} className={`max-w-[75%] ${isAdmin ? "ml-auto" : "mr-auto"}`}>
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words shadow-sm ${isAdmin
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
              {selectedRoomId && typingRoomIds.includes(selectedRoomId) && (
                <div className="mr-auto max-w-[75%] animate-in fade-in duration-300">
                  <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-card border border-border/50 text-text-main text-xs flex items-center gap-2 shadow-sm">
                    <span className="font-medium text-primary">Customer is typing</span>
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

            <form
              onSubmit={handleSend}
              className="p-3 border-t border-border/50 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Type a reply..."
                value={inputMessage}
                onChange={handleAdminInputChange}
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
