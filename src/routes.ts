import { Router } from "express";
import * as l10n from "jm-ez-l10n";
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
        error: l10n.t("ERR_URL_NOT_FOUND"),
      }),
    );
    return router;
  }
}
