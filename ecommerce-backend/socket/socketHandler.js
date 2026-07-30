import { ChatRoom, LiveChatMessage, User } from "../models/index.js";
import crypto from "crypto";

const isValidUuid = (str) =>
  Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

// Track online customer rooms (chatRoomId -> Set of socketIds)
const onlineUserRooms = new Map();
const socketToRoomMap = new Map();

export const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`⚡ New Socket Connection: ${socket.id}`);

    // Admin joins global admin channel and gets initial list of online users
    socket.on("join_admin_room", () => {
      socket.join("admin_room");
      const activeOnlineRoomIds = Array.from(onlineUserRooms.keys());
      socket.emit("online_users_list", { onlineRoomIds: activeOnlineRoomIds });
      console.log(`👨‍💻 Admin Socket joined admin_room: ${socket.id}`);
    });

    socket.on("join_room", async ({ userId, guestId, userType, chatRoomId }) => {
      try {
        let room;

        // 1. ONLY Admin is allowed to force-join a specific customer room by chatRoomId
        if (userType === "admin" && isValidUuid(chatRoomId)) {
          await ChatRoom.update({ unreadAdminCount: 0 }, { where: { id: chatRoomId } });
          await LiveChatMessage.update({ isRead: true }, { where: { chatRoomId } });

          room = await ChatRoom.findByPk(chatRoomId, {
            include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
          });

          if (room) {
            // Clean up any previously joined customer rooms on this admin socket
            const currentRooms = Array.from(socket.rooms);
            currentRooms.forEach((r) => {
              if (r !== socket.id && r !== "admin_room") {
                socket.leave(r);
              }
            });

            socket.join(room.id);
            socket.join("admin_room");

            // Notify admin_room that unreadAdminCount is reset to 0
            io.to("admin_room").emit("room_updated", {
              chatRoomId: room.id,
              unreadAdminCount: 0,
              room,
            });

            const existingMessages = await LiveChatMessage.findAll({
              where: { chatRoomId: room.id },
              order: [["createdAt", "ASC"]],
            });

            return socket.emit("room_joined", {
              chatRoomId: room.id,
              room,
              messages: existingMessages,
            });
          }
        }

        // 2. Registered User (non-admin): Find or Create active room by userId
        if (!room && userId && userType !== "admin") {
          const numericUserId = Number(userId);
          if (!isNaN(numericUserId) && numericUserId > 0) {
            room = await ChatRoom.findOne({
              where: { userId: numericUserId, status: "active" },
              include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
            });

            // Claim active guest room if guestId matches
            const cleanGuestId = guestId ? String(guestId).trim() : "";
            const isValidGuestId = cleanGuestId && cleanGuestId !== "undefined" && cleanGuestId !== "null" && cleanGuestId.length > 5;

            if (!room && isValidGuestId) {
              const guestRoom = await ChatRoom.findOne({
                where: { guestId: cleanGuestId, status: "active" },
              });
              if (guestRoom) {
                await guestRoom.update({
                  userId: numericUserId,
                  userType: "registered",
                });
                room = await ChatRoom.findByPk(guestRoom.id, {
                  include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
                });
              }
            }

            if (!room) {
              room = await ChatRoom.create({
                userId: numericUserId,
                userType: "registered",
              });
              room = await ChatRoom.findByPk(room.id, {
                include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
              });
            }
          }
        }

        // 3. Guest User: Find or Create active room by unique guestId
        const cleanGuestId = guestId ? String(guestId).trim() : "";
        const isValidGuestId = cleanGuestId && cleanGuestId !== "undefined" && cleanGuestId !== "null" && cleanGuestId.length > 5;

        if (!room && isValidGuestId) {
          room = await ChatRoom.findOne({
            where: { guestId: cleanGuestId, status: "active" },
          });
          if (!room) {
            room = await ChatRoom.create({
              guestId: cleanGuestId,
              userType: "guest",
            });
          }
        }

        // 4. Fallback: Create a NEW unique guest room
        if (!room) {
          const fallbackGuestId = `guest_${crypto.randomUUID()}`;
          room = await ChatRoom.create({
            guestId: fallbackGuestId,
            userType: "guest",
          });
        }

        // Leave any previous customer room before joining the new one
        const currentRooms = Array.from(socket.rooms);
        currentRooms.forEach((r) => {
          if (r !== socket.id && r !== "admin_room") {
            socket.leave(r);
          }
        });

        socket.join(room.id);
        console.log(`🔑 Socket ${socket.id} (${userType}) joined room: ${room.id}`);

        // Track online status for customer users (non-admin)
        if (userType !== "admin") {
          const prevRoomId = socketToRoomMap.get(socket.id);
          if (prevRoomId && prevRoomId !== room.id) {
            const socketsInPrev = onlineUserRooms.get(prevRoomId);
            if (socketsInPrev) {
              socketsInPrev.delete(socket.id);
              if (socketsInPrev.size === 0) {
                onlineUserRooms.delete(prevRoomId);
                io.to("admin_room").emit("user_status_changed", { chatRoomId: prevRoomId, isOnline: false });
              }
            }
          }

          socketToRoomMap.set(socket.id, room.id);
          if (!onlineUserRooms.has(room.id)) {
            onlineUserRooms.set(room.id, new Set());
          }
          onlineUserRooms.get(room.id).add(socket.id);

          // Broadcast user online status to admin_room
          io.to("admin_room").emit("user_status_changed", { chatRoomId: room.id, isOnline: true });
        }

        // Notify admin_room about active room metadata
        const roomDetails = await ChatRoom.findByPk(room.id, {
          include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
        });
        io.to("admin_room").emit("room_updated", {
          chatRoomId: room.id,
          room: roomDetails,
        });

        const existingMessages = await LiveChatMessage.findAll({
          where: { chatRoomId: room.id },
          order: [["createdAt", "ASC"]],
        });

        socket.emit("room_joined", {
          chatRoomId: room.id,
          room: roomDetails,
          messages: existingMessages,
        });
      } catch (error) {
        console.error("Error joining room:", error);
        socket.emit("error", { message: "Failed to join chat room." });
      }
    });

    socket.on("send_message", async (data) => {
      let { chatRoomId, senderType, senderId, message, messageType, fileUrl } = data;
      console.log("📩 send_message received:", data);

      try {
        if (!isValidUuid(chatRoomId)) {
          console.error("Invalid chatRoomId provided for send_message:", chatRoomId);
          return socket.emit("error", { message: "Valid chat room ID is required." });
        }

        // Verify if target room exists in DB
        let targetRoom = await ChatRoom.findByPk(chatRoomId);

        // If target room does not exist in DB (e.g. deleted by admin or stale client ID), auto-recover or create room
        if (!targetRoom) {
          console.warn(`⚠️ Chat room ${chatRoomId} not found in DB. Auto-recovering active room...`);
          if (senderType === "user" && Number(senderId) > 0) {
            targetRoom = await ChatRoom.findOne({
              where: { userId: Number(senderId), status: "active" },
            });
            if (!targetRoom) {
              targetRoom = await ChatRoom.create({
                userId: Number(senderId),
                userType: "registered",
              });
            }
          } else {
            const cleanGuestId = senderId ? String(senderId).trim() : `guest_${crypto.randomUUID()}`;
            targetRoom = await ChatRoom.findOne({
              where: { guestId: cleanGuestId, status: "active" },
            });
            if (!targetRoom) {
              targetRoom = await ChatRoom.create({
                guestId: cleanGuestId,
                userType: "guest",
              });
            }
          }

          chatRoomId = targetRoom.id;
          socket.join(chatRoomId);

          // Confirm new room ID to client so client updates its state
          socket.emit("room_joined", {
            chatRoomId: targetRoom.id,
            room: targetRoom,
            messages: [],
          });
        }

        const newMessage = await LiveChatMessage.create({
          chatRoomId,
          senderType,
          senderId: String(senderId),
          message,
          messageType: messageType || "text",
          fileUrl: fileUrl || null,
        });

        await ChatRoom.update(
          {
            lastMessage: message,
            lastMessageAt: new Date(),
          },
          { where: { id: chatRoomId } }
        );

        if (senderType === "admin") {
          await ChatRoom.increment("unreadUserCount", { by: 1, where: { id: chatRoomId } });
        } else {
          await ChatRoom.increment("unreadAdminCount", { by: 1, where: { id: chatRoomId } });
        }

        const roomDetails = await ChatRoom.findByPk(chatRoomId, {
          include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
        });

        // 1. Emit receive_message STRICTLY to the target customer chat room only
        io.to(chatRoomId).emit("receive_message", newMessage);

        // 2. Broadcast room_updated metadata ONLY to admin_room for real-time sidebar & unread count updates
        io.to("admin_room").emit("room_updated", {
          chatRoomId,
          lastMessage: message,
          lastMessageAt: new Date(),
          senderType,
          senderId,
          room: roomDetails,
        });
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message." });
      }
    });

    // Typing indicators
    socket.on("typing_start", ({ chatRoomId, senderType }) => {
      if (!isValidUuid(chatRoomId)) return;
      io.to(chatRoomId).emit("user_typing", { chatRoomId, senderType, isTyping: true });
      if (senderType !== "admin") {
        io.to("admin_room").emit("user_typing", { chatRoomId, senderType, isTyping: true });
      }
    });

    socket.on("typing_stop", ({ chatRoomId, senderType }) => {
      if (!isValidUuid(chatRoomId)) return;
      io.to(chatRoomId).emit("user_typing", { chatRoomId, senderType, isTyping: false });
      if (senderType !== "admin") {
        io.to("admin_room").emit("user_typing", { chatRoomId, senderType, isTyping: false });
      }
    });

    // Mark messages read by Admin or User
    socket.on("mark_read", async ({ chatRoomId, userType }) => {
      try {
        if (!isValidUuid(chatRoomId)) return;

        if (userType === "admin") {
          await ChatRoom.update({ unreadAdminCount: 0 }, { where: { id: chatRoomId } });
          await LiveChatMessage.update({ isRead: true }, { where: { chatRoomId } });

          const roomDetails = await ChatRoom.findByPk(chatRoomId, {
            include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
          });

          io.to("admin_room").emit("room_updated", {
            chatRoomId,
            unreadAdminCount: 0,
            room: roomDetails,
          });
        } else {
          await ChatRoom.update({ unreadUserCount: 0 }, { where: { id: chatRoomId } });
        }
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ User Disconnected: ${socket.id}`);
      const roomId = socketToRoomMap.get(socket.id);
      if (roomId) {
        socketToRoomMap.delete(socket.id);
        const roomSockets = onlineUserRooms.get(roomId);
        if (roomSockets) {
          roomSockets.delete(socket.id);
          if (roomSockets.size === 0) {
            onlineUserRooms.delete(roomId);
            io.to("admin_room").emit("user_status_changed", { chatRoomId: roomId, isOnline: false });
          }
        }
      }
    });
  });
};