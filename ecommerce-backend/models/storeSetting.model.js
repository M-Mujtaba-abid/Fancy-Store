// models/storeSetting.model.js
import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

/**
 * Admin se badalne wali store-wide setting (key/value).
 *
 * Seedha is model ko mat parhna: services/settings.service.js defaults aur
 * validation ke sath parhti hai.
 */
class StoreSetting extends Model {}

StoreSetting.init(
  {
    key: { type: DataTypes.STRING(60), primaryKey: true },
    value: { type: DataTypes.JSONB, allowNull: false },
  },
  {
    sequelize,
    modelName: "StoreSetting",
    tableName: "StoreSettings",
  }
);

export default StoreSetting;
