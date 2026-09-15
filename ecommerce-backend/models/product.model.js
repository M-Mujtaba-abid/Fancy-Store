import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

class Product extends Model { }

Product.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // SEO-friendly public URL segment (/products/<slug>). Generated once at
    // creation time (see services/product.service.js) aur phir kabhi change
    // nahi hota — warna indexed URLs 404 ho jate.
    slug: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    costPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    stockQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    sold: {
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
    // ✅ Product video support (optional)
    videoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // ✅ Social Media Video Link (Instagram/TikTok URL, optional)
    socialVideoUrl: {
      type: DataTypes.STRING,
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
    // Duplicate products ko site se hatane ke liye. DELETE nahi karte kyunke
    // Products par lagi saari FKs (OrderItems, Reviews, CartItems, Wishlists)
    // ON DELETE CASCADE hain — ek duplicate hatane se customer ke orders ki
    // items aur uske reviews bhi mit jate. Archived product kisi public
    // listing mein nahi aata (dekho services/product.service.js ka
    // PUBLIC_VISIBLE), is liye sitemap se bhi khud nikal jata hai, aur uski
    // purani URL client/config/productRedirects.json se keeper par 301 hoti
    // hai.
    isArchived: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    discountPrice: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    vehicleType: {
      type: DataTypes.STRING,
      allowNull: true, // car ya bike
    },
    // product.model.js mein yeh add karo
    subCategory: {
      type: DataTypes.STRING,
      allowNull: true,
      // "floor_mat" | "trunk_tray" | "dashboard_mat" etc.
    },
    averageRating: {
      type: DataTypes.DECIMAL(3, 1),
      defaultValue: 0.0,
    },
    totalReviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    // ✅ AI RAG K LIYE
    embedding: {
      type: 'VECTOR(384)', // String use kar rahe hein kyunke pgvector custom type hai
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Product",
  }
);


Product.associate = (models) => {
  Product.hasMany(models.Review, { foreignKey: "productId", onDelete: "CASCADE" });
  // ✅ Yeh line bhi add karein
  Product.hasMany(models.ProductVariant, {
    foreignKey: "productId",
    as: "variants",
    onDelete: "CASCADE"
  });
};

export default Product;