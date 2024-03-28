import sequelize from "configs/db";
import { DataTypes } from "sequelize";
import { User } from "./user.entity";
import { Product } from "./product.entity";

export const Reviews = sequelize.define("reviews", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  review: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: "id",
    },
    primaryKey: true,
  },
  productId: {
    type: DataTypes.INTEGER,
    references: {
      model: Product,
      key: "id",
    },
    primaryKey: true,
  },
});
