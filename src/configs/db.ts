import { Sequelize } from "sequelize";
import { env } from "./env";

const sequelize = new Sequelize({
  dialect: env.dbDialect,
  host: env.dbHost,
  port: Number(env.dbPort),
  username: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
});

export default sequelize;
