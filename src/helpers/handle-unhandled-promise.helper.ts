import { Log } from "./logger.helper";

export class HandleUnhandledPromise {
  public init() {
    const logger = Log.getLogger();
    process
      .on("unhandledRejection", reason => {
        logger.error("Unhandled Promise Rejection");
        logger.error(reason);
      })
      .on("uncaughtException", err => {
        logger.error("Uncaught Exception thrown");
        logger.error(err);
        process.exit(1);
      });
  }
}
