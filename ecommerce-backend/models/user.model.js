import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

class User extends Model {}

User.init(
  {
    name:   { type: DataTypes.STRING, allowNull: false },
    email:  { type: DataTypes.STRING, allowNull: false, unique: true },
    avatar: { type: DataTypes.STRING, allowNull: true },
    role:   { type: DataTypes.STRING, defaultValue: "user" },
  },
  { sequelize, modelName: "User" }
);

export default User;