import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Wishlist = sequelize.define("Wishlist", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {});

Wishlist.associate = (models) => {
  Wishlist.belongsTo(models.User, { foreignKey: "userId" });
  Wishlist.belongsTo(models.Product, { foreignKey: "productId" });
};

export default Wishlist;