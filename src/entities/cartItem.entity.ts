import { DataTypes } from "sequelize";

import sequelize from "configs/db";
import { Cart } from "./cart.entity";

export const CartItem = sequelize.define("cartItem", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cartId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  productId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
});

CartItem.belongsTo(Cart, { foreignKey: "cartId" });
Cart.hasMany(CartItem, { foreignKey: "cartId" });
