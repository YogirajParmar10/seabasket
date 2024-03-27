import { json, urlencoded } from "body-parser";
import compression from "compression";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import methodOverride from "method-override";
import * as l10n from "jm-ez-l10n";
import { env } from "@configs";
import { destructPager } from "middlewares";
import { EnvValidator, HandleUnhandledPromise, Log } from "@helpers";
import "reflect-metadata";
import Routes from "./routes";
import sequelize from "configs/db";

dotenv.config();

export default class App {
  protected app: express.Application;

  private logger = Log.getLogger();

  public async init() {
    // Handle Unhandled Promise Rejections
    new HandleUnhandledPromise().init();

    // Validate ENV file
    EnvValidator.validate(env);

    // Init Express
    this.app = express();

    // Security
    this.app.use(helmet());
    this.app.use(morgan("tiny"));
    this.app.use(compression());

    // Enable DELETE and PUT
    this.app.use(methodOverride());

    // Translation
    l10n.setTranslationsFile("en", "src/language/translation.en.json");
    this.app.use(l10n.enableL10NExpress);

    // Body Parsing
    this.app.use(json({ limit: "50mb" }));
    this.app.use(urlencoded({ extended: true }));

    // Destruct Pager from query string and typecast to numbers
    this.app.use(destructPager);

    // Initialize Sequelize
    await sequelize.sync();

    // Routing
    const routes = new Routes();
    this.app.use("/", routes.configure());

    // Start server
    this.app.listen(process.env.PORT, () => {
      this.logger.info(`The server is running in port localhost: ${process.env.PORT}`);
    });
  }

  public getExpresApp() {
    return this.app;
  }
}
