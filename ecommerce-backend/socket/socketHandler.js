import { ChatRoom } from "../models";


export const initializeSocket = (io) => {

    io.on("connection"), (socket) => {
        console.log(`⚡ New Socket Connection: ${socket.id}`);


        socket.on(join_room, async ({ UserId, guestId, userType, chatRoomId }) => {
            try {
                let Room
                if (chatRoomId) {
                    Room = await ChatRoom.findByPk(chatRoomId);
                }
                if (Room) {
                    Room = await ChatRoom.create({
                        userId: UserId,
                        guestId: guestId,
                        userType: userType,
                        chatRoomId: chatRoomId,
                    })
                }

                socket.join(Room.id);
                console.log(`User/Guest joined room: ${Room.id}`);

                // Client ko room ID confirm bhejein (Guest ise localStorage me save karega)
                socket.emit('room_joined', { chatRoomId: Room.id });
            } catch {
                console.error('Error joining room:', error);
                socket.emit('error', { message: 'Failed to join chat room.' });
            }

        })

        socket.on('send_message', async (data) => {
            const { chatRoomId, senderType, senderId, message, messageType, fileUrl } = data;

            try {
                // 1. Database me Message Save karein
                const newMessage = await LiveChatMessage.create({
                    chatRoomId,
                    senderType, // 'user', 'guest', ya 'admin'
                    senderId,
                    message,
                    messageType: messageType || 'text',
                    fileUrl: fileUrl || null
                });

                // 2. ChatRoom table me last message aur unread counts update karein
                const updateData = {
                    lastMessage: message,
                    lastMessageAt: new Date()
                };

                if (senderType === 'admin') {
                    updateData.unreadUserCount = ChatRoom.sequelize.literal('unreadUserCount + 1');
                } else {
                    updateData.unreadAdminCount = ChatRoom.sequelize.literal('unreadAdminCount + 1');
                }

                await ChatRoom.update(updateData, { where: { id: chatRoomId } });

                // 3. Specific Room ke andar live message broadcast karein
                io.to(chatRoomId).emit('receive_message', newMessage);

            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('error', { message: 'Failed to send message.' });
            }
        });

        socket.on('disconnect', () => {
            console.log(`❌ User Disconnected: ${socket.id}`);
        });
    })

}
}