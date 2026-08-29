import sequelize from "../config/db.js";
import Cart from "./cart.model.js";
import CartItem from "./cartItem.model.js";
import Category from "./category.model.js";
import Product from "./product.model.js";
import User from "./user.model.js";
import UserIdentity from "./userIdentity.model.js";  // ✅ add
import Order from "./order.model.js";
import OrderItem from "./orderItem.model.js";
import Review from "./review.model.js";
import Wishlist from "./wishlist.model.js";
import ChatMessage from "./chatMessage.model.js";
import ProductVariant from "./productVariant.model.js";
import LiveChatMessage from "./liveChatMessage.model.js";
import ChatRoom from "./chatRoom.model.js";
import BlogPost from "./blogPost.model.js";

const models = {
  User,
  UserIdentity,
  Product,
  ProductVariant,
  // NOTE: Category ka Product ke saath koi association NAHI hai — link sirf
  // `slug` string ke through hai. Yahan hasMany/belongsTo add na karein.
  Category,
  // NOTE: BlogPost ka bhi Product/Category ke saath koi association NAHI —
  // link sirf relatedProductSlugs/relatedCategorySlugs (slug strings) se hai.
  BlogPost,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Review,
  Wishlist,
  ChatMessage,
  ChatRoom,
  LiveChatMessage,
};

// Associations
User.hasMany(UserIdentity, { foreignKey: "userId", onDelete: "CASCADE" });
UserIdentity.belongsTo(User, { foreignKey: "userId" });
User.hasMany(ChatMessage, { foreignKey: "userId", onDelete: "SET NULL" });
ProductVariant.belongsTo(Product, { foreignKey: "productId" });

//Room
User.hasMany(ChatRoom, { foreignKey: "userId", onDelete: "SET NULL", as: "chatRooms" });
ChatRoom.belongsTo(User, { foreignKey: "userId", as: "user" });

//meesgae
ChatRoom.hasMany(LiveChatMessage, { foreignKey: "chatRoomId", onDelete: "CASCADE", as: "messages" });
LiveChatMessage.belongsTo(ChatRoom, { foreignKey: "chatRoomId", as: "room" });

// Baaki associations
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

export {
  sequelize,
  User,
  UserIdentity,
  Product,
  ProductVariant,
  Category,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Review,
  Wishlist,
  ChatMessage,
  ChatRoom,
  LiveChatMessage,
  BlogPost,
};
export default models;