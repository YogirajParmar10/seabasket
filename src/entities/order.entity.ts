import { DataTypes } from "sequelize";

import sequelize from "configs/db";
import { User } from "./user.entity";
import { OrderDetails } from "./orderDetails.entity";

export const Orders = sequelize.define("order", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isCancelled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
});

Orders.hasMany(OrderDetails, { foreignKey: "orderId" });
OrderDetails.belongsTo(Orders, { foreignKey: "orderId" });
