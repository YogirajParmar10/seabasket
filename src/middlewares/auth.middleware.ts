import { UserInfo, TRequest, TResponse } from "@types";
import { User } from "@entities";
import { JwtHelper } from "@helpers";

export class AuthMiddleware {
  constructor() {}

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
            res.status(401).json({ error: "Unauthorized", code: 401 });
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          res.status(500).json({ error: "Internal Server Error", code: 500 });
        }
      } else {
        res.status(401).json({ error: "Unauthorized", code: 401 });
      }
    } else {
      res.status(401).json({ error: "Unauthorized", code: 401 });
    }
  };
}
