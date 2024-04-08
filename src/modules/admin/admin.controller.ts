import { NextFunction } from "express";
import { TRequest, TResponse } from "@types";
import { Product } from "@entities";
import { CreateProductDto, FilterProductDto, UpdateProductDto } from "./dto";
import { Op } from "sequelize";
import {env} from "configs"

export class AdminController {
  public createProduct = async (req: TRequest<CreateProductDto>, res: TResponse, next: NextFunction) => {
    const { title, imageUrl, price, description, category } = req.dto;
    const userId = req.user.id;

    try {
      const product = await Product.create({
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description,
        userId: userId,
        category: category,
      });
      return res.status(201).json({ message: "Product created!" });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = env.statuscode.internal_server_error;
      }
      next(err);
    }
  };

  public getAllProducts = async (req: TRequest, res: TResponse, next: NextFunction) => {
    const userId = req.user.id;
    try {
      const products = await Product.findAll({ where: { userId: userId }, order: ["price"] });
      if (!products) {
        const error = new Error("No products found!");
        throw error;
      }

      return res.status(env.statuscode.success).json({ product: products });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = env.statuscode.internal_server_error;
      }
      next(err);
    }
  };

  public getProductDetail = async (req: TRequest, res: TResponse, next: NextFunction) => {
    const { productId } = req.params;
    const userId = req.user.id;
    try {
      const product = await Product.findOne({ where: { id: productId, userId: userId } });

      if (!product) {
        return res.status(env.statuscode.not_found).json({ message: "No product found" });
      } else {
        return res.status(env.statuscode.success).json({ product: product });
      }
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = env.statuscode.internal_server_error;
      }
      next(err);
    }
  };

  public filterProduct = async (req: TRequest<FilterProductDto>, res: TResponse, next: NextFunction) => {
    const { category, max_price, min_price, rating, discount } = req.query;
    const userId = req.user.id;
    const filter: any = {};
    try {
      if (category) {
        filter.category = category;
      }

      if (rating !== undefined) {
        filter.rating = rating;
      }

      if (min_price !== undefined && max_price !== undefined) {
        filter.price = {
          [Op.between]: [min_price, max_price],
        };
      }

      if (discount !== undefined) {
        filter.discount = discount;
      }

      const products = await Product.findAll({
        where: {
          [Op.and]: [filter],
          userId: userId,
        },
      });

      if (!products || products.length === 0) {
        return res.status(env.statuscode.not_found).json({ message: "No product found !" });
      }

      return res.status(env.statuscode.success).json({ products: products });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = env.statuscode.internal_server_error;
      }
      next(err);
    }
  };

  public updateProduct = async (req: TRequest<UpdateProductDto>, res: TResponse, next: NextFunction) => {
    const { productId } = req.params;
    const { title, imageUrl, price, description, category } = req.dto;
    const userId = req.user.id;

    try {
      const product = await Product.findByPk(productId);

      if (product?.dataValues.userId !== +userId!) {
        return res.status(env.statuscode.unauthorized).json({ message: "user not authorized!" });
      }

      const updatedProduct = await Product.update(
        {
          title: title,
          imageUrl: imageUrl,
          price: price,
          description: description,
          category: category,
        },
        {
          where: {
            id: productId,
          },
        },
      );
      if (!updatedProduct) {
        return res.status(env.statuscode.not_found).json({ message: "Failed to update product" });
      }
      return res.status(env.statuscode.success).json({ message: "Product Updated!" });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = env.statuscode.internal_server_error;
      }
      next(err);
    }
  };

  public deleteProduct = async (req: TRequest<UpdateProductDto>, res: TResponse, next: NextFunction) => {
    const { productId } = req.params;
    const userId = req.user.id;

    try {
      const product = await Product.findByPk(productId);

      if (product?.dataValues.userId !== +userId!) {
        return res.status(env.statuscode.unauthorized).json({ message: "user not authorized!" });
      }

      await product?.destroy();
      return res.status(env.statuscode.success).json({ message: "Product deleted!" });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = env.statuscode.internal_server_error;
      }
      next(err);
    }
  };
}
