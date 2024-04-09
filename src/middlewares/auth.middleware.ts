import { UserInfo, TRequest, TResponse } from "@types";
import { User } from "@entities";
import { JwtHelper } from "@helpers";
import {env} from "@configs"

export class AuthMiddleware {

  public auth = async (req: TRequest, res: TResponse, next: () => void) => {
    if (req.headers && req.headers.authorization) {
      const tokenInfo: any = JwtHelper.justDecode(req.headers.authorization.toString().replace("Bearer ", ""));
      if (tokenInfo) {
        try {
          const user = await User.findByPk(tokenInfo.id);

          if (user) {
            req.user = user.toJSON() as UserInfo;
            next();
          } else {
            res.status(env.statuscode.unAuthorized).json({ error: "unAuthorized", code: env.statuscode.unAuthorized });
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          res.status(env.statuscode.internalServerError).json({ error: "Internal Server Error", code: env.statuscode.internalServerError });
        }
      } else {
        res.status(env.statuscode.unAuthorized).json({ error: "unAuthorized", code: env.statuscode.unAuthorized });
      }
    } else {
      res.status(env.statuscode.unAuthorized).json({ error: "unAuthorized", code: env.statuscode.unAuthorized });
    }
  };
}
