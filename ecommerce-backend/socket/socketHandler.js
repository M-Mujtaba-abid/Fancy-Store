import { ChatRoom, LiveChatMessage } from "../models/index.js";

export const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`⚡ New Socket Connection: ${socket.id}`);

    socket.on("join_room", async ({ userId, guestId, userType, chatRoomId }) => {
      try {
        let room;
        if (chatRoomId) {
          room = await ChatRoom.findByPk(chatRoomId);
        }
        if (!room) {
          room = await ChatRoom.create({
            userId: userId || null,
            guestId: guestId || null,
            userType: userType || "guest",
          });
        }

        socket.join(room.id);
        console.log(`User/Guest joined room: ${room.id}`);

        // Client ko room ID confirm bhejein (Guest ise localStorage me save karega)
        socket.emit("room_joined", { chatRoomId: room.id });
      } catch (error) {
        console.error("Error joining room:", error);
        socket.emit("error", { message: "Failed to join chat room." });
      }
    });

    socket.on("send_message", async (data) => {
      const { chatRoomId, senderType, senderId, message, messageType, fileUrl } = data;

      try {
        // 1. Database me Message Save karein
        const newMessage = await LiveChatMessage.create({
          chatRoomId,
          senderType, // 'user', 'guest', ya 'admin'
          senderId,
          message,
          messageType: messageType || "text",
          fileUrl: fileUrl || null,
        });

        // 2. ChatRoom table me last message aur unread counts update karein
        const updateData = {
          lastMessage: message,
          lastMessageAt: new Date(),
        };

        if (senderType === "admin") {
          updateData.unreadUserCount = ChatRoom.sequelize.literal('"unreadUserCount" + 1');
        } else {
          updateData.unreadAdminCount = ChatRoom.sequelize.literal('"unreadAdminCount" + 1');
        }

        await ChatRoom.update(updateData, { where: { id: chatRoomId } });

        // 3. Specific Room ke andar live message broadcast karein
        io.to(chatRoomId).emit("receive_message", newMessage);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message." });
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ User Disconnected: ${socket.id}`);
    });
  });
};