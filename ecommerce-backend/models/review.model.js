import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Review = sequelize.define("Review", {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 },
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    images: { type: DataTypes.JSON, allowNull: true },
    adminReply: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {});

Review.associate = (models) => {
    Review.belongsTo(models.User, { foreignKey: "userId" });
    Review.belongsTo(models.Product, { foreignKey: "productId" });
};

export default Review;