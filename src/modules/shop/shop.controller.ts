import { NextFunction, Request, Response } from "express";
import { TRequest, TResponse } from "@types";
import Product from "entities/product.entity";
import { ProductByCategoryDto } from "./dto";
import { SearchProductDto } from "./dto/search-product.dto";
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
    const { prodId } = req.params;
    try {
      const prod = await Product.findByPk(prodId);
      if (!prod) {
        return res.status(404).json({ message: "No product found" });
      } else {
        return res.status(200).json({ product: prod });
      }
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };

  public getProductsByCategory = async (req: TRequest<ProductByCategoryDto>, res: TResponse, next: NextFunction) => {
    const category = req.dto.category;

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
}
