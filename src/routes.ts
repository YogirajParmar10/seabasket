import { Router } from "express";
import { AuthRouter } from "@modules/auth";
import { AdminRouter } from "@modules/admin";
import { ShopRouter } from "@modules/shop";

export default class Routes {
  public configure() {
    const router = Router();
    router.use("/auth", new AuthRouter().router);
    router.use("/admin", new AdminRouter().router);
    router.use("/shop", new ShopRouter().router);
    router.all("/*", (req, res) =>
      res.status(404).json({
        error: "ERR_URL_NOT_FOUND",
      }),
    );
    return router;
  }
}
