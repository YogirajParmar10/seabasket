import bcrypt from "bcrypt";
import { Constants } from "@configs";

export class Bcrypt {
  public static async hash(password: string): Promise<string> {
    const hashPassword = await bcrypt.hash(password, Constants.BCRYPT_SALT_ROUND);
    return hashPassword;
  }

  public static verify(plainTextPassword: string, hashPassword: string): Promise<boolean> {
    const verify = bcrypt.compare(plainTextPassword, hashPassword);
    return verify;
  }
}
