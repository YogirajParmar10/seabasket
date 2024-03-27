import path from "path";
import { Router } from "express";
import { Log } from "./logger.helper";

export class SFRouter {
  private logger = Log.getLogger(`${path.relative(process.cwd(), __dirname)}/${this.constructor.name}`);

  public router: Router;

  constructor() {
    this.router = Router();
    this.initRoutes();
  }

  protected initRoutes() {
    this.logger.error("`initRoutes` is not implemented!");
  }
}
