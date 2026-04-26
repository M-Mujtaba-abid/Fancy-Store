import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const UserIdentity = sequelize.define("UserIdentity", {
  id:             { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId:         { type: DataTypes.INTEGER, allowNull: false },
  provider:       { type: DataTypes.ENUM("local", "google"), allowNull: false },
  providerId:     { type: DataTypes.STRING, allowNull: true },
  password:       { type: DataTypes.STRING, allowNull: true },
  resetOtp:       { type: DataTypes.STRING, allowNull: true },
  resetOtpExpiry: { type: DataTypes.DATE,   allowNull: true },
});

export default UserIdentity;