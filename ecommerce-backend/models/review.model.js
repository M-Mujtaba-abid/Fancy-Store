// import { DataTypes } from "sequelize";
// import sequelize from "../config/db.js";

// const Review = sequelize.define("Review", {
//     userId: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//     },
//     productId: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//     },
//     rating: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         validate: { min: 1, max: 5 },
//     },
//     comment: {
//         type: DataTypes.TEXT,
//         allowNull: true,
//     },
//     images: { type: DataTypes.JSON, allowNull: true },
//     adminReply: {
//         type: DataTypes.TEXT,
//         allowNull: true,
//     },
// }, {});

// Review.associate = (models) => {
//     Review.belongsTo(models.User, { foreignKey: "userId" });
//     Review.belongsTo(models.Product, { foreignKey: "productId" });
// };

// export default Review;





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
    // Images array ko store karne ke liye JSON theek hai
    images: { 
        type: DataTypes.JSON, 
        allowNull: true,
        defaultValue: [] 
    },
    // ✅ Moderation ke liye: Default false hoga
    isApproved: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    adminReply: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    // Indexes add karne se search fast ho jati hai
    indexes: [
        { fields: ['productId', 'isApproved'] }, // Product page par approved reviews jaldi load honge
        { fields: ['userId'] }
    ]
});

Review.associate = (models) => {
    Review.belongsTo(models.User, { foreignKey: "userId" });
    Review.belongsTo(models.Product, { foreignKey: "productId" });
};

export default Review;