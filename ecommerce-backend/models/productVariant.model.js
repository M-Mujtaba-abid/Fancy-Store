import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

class ProductVariant extends Model { }

ProductVariant.init(
  {
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    variantType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "material",
      validate: {
        notEmpty: { msg: "Variant type cannot be empty" }
      }
    },
    variantValue: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Variant value cannot be empty" }
      }
    },
    materialName: {
      type: DataTypes.STRING,
      allowNull: true,
      get() {
        // Backward compatibility fallback for materialName
        return this.getDataValue("variantValue") || this.getDataValue("materialName") || null;
      }
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: { args: [0], msg: "Price cannot be negative" }
      }
    },
    salePrice: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: { args: [0], msg: "Sale price cannot be negative" }
      }
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 50,
      validate: {
        min: { args: [0], msg: "Stock cannot be negative" }
      }
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "active",
      validate: {
        isIn: {
          args: [["active", "inactive"]],
          msg: "Status must be either active or inactive"
        }
      }
    }
  },
  {
    sequelize,
    modelName: "ProductVariant",
  }
);

export default ProductVariant;