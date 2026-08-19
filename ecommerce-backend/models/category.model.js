// models/category.model.js
import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

// Slug-based registry. Products.category se koi FK/association NAHI hai —
// link sirf `slug` string ke through hai. Isliye yahan koi `associate()` mat
// add karna: models/index.js usko auto-invoke karta hai aur FK-less
// association `include` paths tod degi.
class Category extends Model { }

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // Products.category isi value ko store karta hai, e.g. "car_topCover"
    slug: {
      type: DataTypes.STRING(60),
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    subtitle: {
      type: DataTypes.STRING(160),
      allowNull: true,
    },
    // local path ya Cloudinary secure_url
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    suggestedVariantType: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "Material",
    },
    // 'exact' | 'fuzzy' — dekho services/product.service.js ka
    // getProductsByFilterService. 'fuzzy' sirf legacy grandfathering ke liye.
    matchMode: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "exact",
    },
    showOnHome: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "Category",
    tableName: "Categories",
  }
);

export default Category;
