

import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

class User extends Model {}

User.init(
  {
    name: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true,   // ✅ ek email sirf ek user ke liye
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "user", // ✅ agar koi role na ho to default user
    },

    // ✅ New fields for OTP system
    resetOtp: {
      type: DataTypes.STRING,  // ya DataTypes.INTEGER agar fixed digits ho
      allowNull: true,
    },
    resetOtpExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
  }
);

export default User;
