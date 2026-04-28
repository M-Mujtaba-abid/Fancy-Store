// models/contact.model.js
import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

class Contact extends Model { }

Contact.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    category: {
      type: DataTypes.ENUM("order_issue", "payment", "return_refund", "general", "other"),
      defaultValue: "general",
    },
    subject: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // ✅ Ye naya field add karein
    is_replied: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Contact",
    tableName: "contacts",
    timestamps: false, // hum custom created_at use kar rahe hain
  }
);

export default Contact;
