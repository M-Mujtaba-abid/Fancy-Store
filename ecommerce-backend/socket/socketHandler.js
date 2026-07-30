import { ChatRoom, LiveChatMessage, User } from "../models/index.js";

const isValidUuid = (str) =>
  Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

export const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`⚡ New Socket Connection: ${socket.id}`);

    // Admin joins global admin channel
    socket.on("join_admin_room", () => {
      socket.join("admin_room");
      console.log(`👨‍💻 Admin Socket joined admin_room: ${socket.id}`);
    });

    socket.on("join_room", async ({ userId, guestId, userType, chatRoomId }) => {
      try {
        let room;

        // 1. ONLY Admin is allowed to force-join a room by chatRoomId
        if (userType === "admin" && isValidUuid(chatRoomId)) {
          // Reset unreadAdminCount to 0 when Admin opens/joins room
          await ChatRoom.update({ unreadAdminCount: 0 }, { where: { id: chatRoomId } });
          await LiveChatMessage.update({ isRead: true }, { where: { chatRoomId } });

          room = await ChatRoom.findByPk(chatRoomId, {
            include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
          });

          // Notify admin_room that unreadAdminCount is reset to 0
          io.to("admin_room").emit("room_updated", {
            chatRoomId,
            unreadAdminCount: 0,
            room,
          });
        }

        // 2. Registered User (non-admin): Find or Create active room by userId
        if (!room && userId && userType !== "admin") {
          const numericUserId = Number(userId);
          if (!isNaN(numericUserId)) {
            room = await ChatRoom.findOne({
              where: { userId: numericUserId, status: "active" },
              include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
            });
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

        // 3. Guest User: Find or Create active room by guestId
        if (!room && guestId) {
          const cleanGuestId = String(guestId).trim();
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

        // 4. Fallback if valid chatRoomId passed
        if (!room && isValidUuid(chatRoomId)) {
          room = await ChatRoom.findByPk(chatRoomId);
        }

        // 5. Ultimate fallback if still no room
        if (!room) {
          const fallbackGuestId = `guest_${socket.id}`;
          room = await ChatRoom.create({
            guestId: fallbackGuestId,
            userType: userType || "guest",
          });
        }

        socket.join(room.id);
        console.log(`🔑 User/Guest/Admin (${userType}) joined room: ${room.id} (User: ${userId || guestId})`);

        // If user is Admin, also auto-join admin_room
        if (userType === "admin") {
          socket.join("admin_room");
          console.log(`👨‍💻 Auto-joined Admin socket: ${socket.id} to admin_room`);
        }

        // Fetch existing messages for this room
        const existingMessages = await LiveChatMessage.findAll({
          where: { chatRoomId: room.id },
          order: [["createdAt", "ASC"]],
        });

        // Client ko room ID confirm bhejein aur history
        socket.emit("room_joined", {
          chatRoomId: room.id,
          room,
          messages: existingMessages,
        });
      } catch (error) {
        console.error("Error joining room:", error);
        socket.emit("error", { message: "Failed to join chat room." });
      }
    });

    socket.on("send_message", async (data) => {
      const { chatRoomId, senderType, senderId, message, messageType, fileUrl } = data;
      console.log("📩 send_message received:", data);

      try {
        if (!isValidUuid(chatRoomId)) {
          console.error("Invalid chatRoomId provided for send_message:", chatRoomId);
          return socket.emit("error", { message: "Valid chat room ID is required." });
        }

        // 1. Save message to DB
        const newMessage = await LiveChatMessage.create({
          chatRoomId,
          senderType, // 'user', 'guest', ya 'admin'
          senderId: String(senderId),
          message,
          messageType: messageType || "text",
          fileUrl: fileUrl || null,
        });

        // 2. Update ChatRoom metadata & unread counters
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

        // Fetch enriched room details including User info
        const roomDetails = await ChatRoom.findByPk(chatRoomId, {
          include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
        });

        // 3. Broadcast message to the specific customer room
        io.to(chatRoomId).emit("receive_message", newMessage);

        // 4. ALSO broadcast to admin_room so connected Admins receive customer messages & room updates in real-time
        io.to("admin_room").emit("receive_message", newMessage);
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
    });
  });
};