import { Sequelize } from "sequelize";
import { env } from "./env";

const sequelize = new Sequelize({
  dialect: env.dbDialect,
  host: env.dbHost,
  port: Number(env.dbPort), // Ensure port is parsed as a number
  username: env.dbUser,
  password: env.dbPassword,
  database: env.dbName, // Provide database name directly
});

export default sequelize;
