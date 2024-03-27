import { RouterDelegates } from "@types";
import { InjectCls, SFRouter, Validator } from "@helpers";
import { AuthMiddleware } from "@middlewares";
import { ShopController } from "./shop.controller";
import { ProductByCategoryDto, SearchProductDto } from "./dto";

export class ShopRouter extends SFRouter implements RouterDelegates {
  @InjectCls(ShopController)
  private ShopController: ShopController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  initRoutes(): void {
    this.router.get("/products", this.ShopController.getShop);
    this.router.get("/products/:prodId", this.ShopController.getProductDetail);
    this.router.post("/products/search", Validator.validate(SearchProductDto), this.ShopController.searchProduct);
    this.router.post("/products/by-category", Validator.validate(ProductByCategoryDto), this.ShopController.getProductsByCategory);
  }
}
