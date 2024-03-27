import { RouterDelegates } from "@types";
import { InjectCls, SFRouter, Validator } from "@helpers";
import { AuthMiddleware } from "@middlewares";
import { CreateProductDto, ProductByCategoryDto } from "./dto";
import { AdminController } from "./admin.controller";
import { UpdateProductDto } from "./dto/update-product.dto";

export class AdminRouter extends SFRouter implements RouterDelegates {
  @InjectCls(AdminController)
  private AdminController: AdminController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  initRoutes(): void {
    this.router.get("/products", this.authMiddleware.auth, this.AdminController.getAllProducts);
    this.router.get("/products/:prodId", this.authMiddleware.auth, this.AdminController.getProductDetail);
    this.router.post("/product", Validator.validate(CreateProductDto), this.authMiddleware.auth, this.AdminController.createProduct);
    this.router.post("/products/by-category", Validator.validate(ProductByCategoryDto), this.authMiddleware.auth, this.AdminController.getProductsByCategory);
    this.router.put("/update-product/:prodId", Validator.validate(UpdateProductDto), this.authMiddleware.auth, this.AdminController.updateProduct);
    this.router.delete("/delete-product/:prodId", this.authMiddleware.auth, this.AdminController.deleteProduct);
  }
}