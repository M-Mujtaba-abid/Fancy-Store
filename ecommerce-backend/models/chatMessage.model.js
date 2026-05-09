import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ChatMessage = sequelize.define(
  "ChatMessage",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("user", "assistant"),
      allowNull: false,
    },
    userId: {
      // Users table currently uses INTEGER id in this project.
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {},
);

ChatMessage.associate = (models) => {
  ChatMessage.belongsTo(models.User, { foreignKey: "userId" });
};

export default ChatMessage;
