import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

class ProductVariant extends Model { }

ProductVariant.init(
    {
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        materialName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                // ✅ Yeh Enum wala hi kaam karega, lekin bina database strictness ke
                isIn: {
                    args: [["Silver Coated", "Black Coated", "PVC + Cotton", "Micro Fiber"]],
                    msg: "Invalid material quality selected"
                }
            }
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false, // Is quality ki price (e.g. 4497)
        },
        stock: {
            type: DataTypes.INTEGER,
            defaultValue: 50,
        },
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    },
    {
        sequelize,
        modelName: "ProductVariant",
    }
);

export default ProductVariant;