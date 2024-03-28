import { NextFunction, Request, Response } from "express";
import { TRequest, TResponse } from "@types";
import { Product, Cart, CartItem } from "entities";
import { ProductByCategoryDto, SearchProductDto } from "./dto";
import { Op } from "sequelize";

export class ShopController {
  public getShop = async (req: TRequest, res: TResponse, next: NextFunction) => {
    try {
      const products = await Product.findAll({ order: ["price"] });
      if (!products) {
        res.json({ message: "No Products found!" });
      }
      return res.status(200).json({ products: products });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };

  public getProductDetail = async (req: TRequest, res: TResponse, next: NextFunction) => {
    const { productId } = req.params;
    try {
      const product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({ message: "No product found" });
      } else {
        return res.status(200).json({ product: product });
      }
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };

  public getProductsByCategory = async (req: TRequest<ProductByCategoryDto>, res: TResponse, next: NextFunction) => {
    const { category } = req.params;

    try {
      const products = await Product.findAll({
        where: {
          category: category,
        },
      });
      if (!products || products.length === 0) {
        return res.status(404).json({ message: "No product found for this category!" });
      }
      return res.status(200).json({ products: products });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };

  public searchProduct = async (req: TRequest<SearchProductDto>, res: TResponse, next: NextFunction) => {
    const title = req.dto.title;

    try {
      const products = await Product.findAll({
        where: {
          title: {
            [Op.like]: `%${title}%`,
          },
        },
      });
      if (!products || products.length === 0) {
        return res.status(404).json({ message: "No product found" });
      }
      return res.status(200).json({ products: products });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };
  public getCart = async (req: TRequest<SearchProductDto>, res: TResponse, next: NextFunction) => {
    const userId = req.me.id;

    const userCart = await Cart.findOne({
      where: { userId: userId },
      include: [
        {
          model: CartItem,
          include: [
            {
              model: Product,
            },
          ],
        },
      ],
    });
    if (!userCart) {
      return { error: "Cart not found for user" };
    }

    return res.status(200).json({ Cart: userCart });
  };
}
