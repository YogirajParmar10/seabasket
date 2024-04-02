import sequelize from "configs/db";
import { DataTypes } from "sequelize";

export const Otp = sequelize.define("otp", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  otp: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});
