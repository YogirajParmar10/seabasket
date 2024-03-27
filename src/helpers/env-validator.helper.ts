import { validate } from "class-validator";
import { Log } from "./logger.helper";

export class EnvValidator {
  public static logger = Log.getLogger();

  public static async validate<T extends object>(env: T) {
    const errors = await validate(env);
    if (errors.length > 0) {
      EnvValidator.logger.error(
        "ENV file is  invalid",
        errors.map(({ constraints }) => constraints),
      );
      throw new Error("ENV file is  invalid");
    } else {
      EnvValidator.logger.info("ENV file validated");
    }
  }
}
