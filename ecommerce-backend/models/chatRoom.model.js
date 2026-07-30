import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ChatRoom = sequelize.define("ChatRoom", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER, // Agar aapke User model ki ID integer hai
        allowNull: true,
    },
    guestId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    userType: {
        type: DataTypes.ENUM("guest", "registered"),
        allowNull: false,
        defaultValue: "guest",
    },
    status: {
        type: DataTypes.ENUM("active", "closed", "archived"),
        defaultValue: "active",
    },
    lastMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    lastMessageAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    unreadAdminCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    unreadUserCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
});

export default ChatRoom;