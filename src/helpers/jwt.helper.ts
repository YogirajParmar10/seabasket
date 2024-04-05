import jwt from "jsonwebtoken";
import { Constants } from "../configs/constants";

export class JwtHelper {
  public static encode<T extends object>(data: T) {
    return jwt.sign(data, `${process.env.JWT_SECRET}_${Constants.JWT_TOKEN_VERSION}`);
  }

  public static decode<ResT>(token: string) {
    if (token) {
      try {
        return jwt.verify(token, `${process.env.JWT_SECRET}`) as ResT;
      } catch (error) {
        return false;
      }
    }
    return false;
  }

  public static justDecode(token: string) {
    if (token) {
      try {
        return jwt.decode(token);
      } catch (error) {
        return false;
      }
    }
    return false;
  }
}
