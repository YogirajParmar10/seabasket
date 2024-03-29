import { RouterDelegates } from "@types";
import { InjectCls, SFRouter, Validator } from "helpers";
import { AuthMiddleware } from "@middlewares";
import { ShopController } from "./shop.controller";
import { CartDto, ProductByCategoryDto, SearchProductDto, ReviewsDto, OrderDto } from "./dto";

export class ShopRouter extends SFRouter implements RouterDelegates {
  @InjectCls(ShopController)
  private ShopController: ShopController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  initRoutes(): void {
    //public routes
    this.router.get("/products", this.ShopController.getShop);
    this.router.get("/products/:productId", this.ShopController.getProductDetail);
    this.router.post("/products/search", Validator.validate(SearchProductDto), this.ShopController.searchProduct);
    this.router.post("/products/:category", Validator.validate(ProductByCategoryDto), this.ShopController.filterProduct);
    this.router.get("/reviews/:productId", this.ShopController.getReviews);

    //Authenticated Routes
    this.router.get("/cart", this.authMiddleware.auth, this.ShopController.getCart);
    this.router.post("/cart/add-product", Validator.validate(CartDto), this.authMiddleware.auth, this.ShopController.addToCart);
    this.router.delete("/cart", this.authMiddleware.auth, this.ShopController.removeItemFromCart);
    this.router.post("/reviews/:productId", Validator.validate(ReviewsDto), this.authMiddleware.auth, this.ShopController.postReviews);

    //Order Routes
    this.router.post("/order", Validator.validate(OrderDto), this.authMiddleware.auth, this.ShopController.postOrder);
    this.router.get("/order", this.authMiddleware.auth, this.ShopController.getOrders);
    this.router.get("/order/:orderId", this.authMiddleware.auth, this.ShopController.getOrderDetail);
  }
}
