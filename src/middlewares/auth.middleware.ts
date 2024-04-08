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
            res.status(env.statuscode.unauthorized).json({ error: "Unauthorized", code: env.statuscode.unauthorized });
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          res.status(env.statuscode.internal_server_error).json({ error: "Internal Server Error", code: env.statuscode.internal_server_error });
        }
      } else {
        res.status(env.statuscode.unauthorized).json({ error: "Unauthorized", code: env.statuscode.unauthorized });
      }
    } else {
      res.status(env.statuscode.unauthorized).json({ error: "Unauthorized", code: env.statuscode.unauthorized });
    }
  };
}
