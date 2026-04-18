import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

class Product extends Model {}

Product.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING, // Main Image URL
    },
    images: {
      type: DataTypes.JSON, // Multiple Images Array
      allowNull: true,
    },
    carModel: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    material: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // ✅ Professional Features Fields
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isNewArrival: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isOnSale: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    discountPrice: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "Product",
  }
);

export default Product;