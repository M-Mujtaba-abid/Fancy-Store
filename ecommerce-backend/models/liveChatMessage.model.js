import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const LiveChatMessage = sequelize.define("LiveChatMessage", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    chatRoomId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    senderType: {
        type: DataTypes.ENUM("user", "guest", "admin"),
        allowNull: false,
    },
    senderId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    messageType: {
        type: DataTypes.ENUM("text", "image", "file"),
        defaultValue: "text",
    },
    fileUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
});

export default LiveChatMessage;