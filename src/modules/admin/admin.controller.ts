import { NextFunction } from "express";
import { TRequest, TResponse } from "@types";
import { Product } from "@entities";
import { CreateProductDto, UpdateProductDto } from "./dto";
import { Op } from "sequelize";
import {env} from "configs"

export class AdminController {
  public createProduct = async (req: TRequest<CreateProductDto>, res: TResponse, next: NextFunction) => {
    const { title, imageUrl, price, description, category, discount, rating } = req.dto;
    const userId = req.user.id;

    try {
      const product = await Product.create({
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description,
        userId: userId,
        category: category,
        discount: discount,
        rating: rating
      });
      return res.status(201).json({ message: "Product created!" });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = env.statuscode.internalServerError;
      }
      next(err);
    }
  };

  public getAllProducts = async (req: TRequest, res: TResponse, next: NextFunction) => {
    const userId = req.user.id;
    try {
      const { category, max_price, min_price, rating, discount } = req.query;
      const filter: any = {};
      let products;

      if (category) {
        filter.category = {
          [Op.like]: [category],
        };;
      }
  
      if (rating !== undefined) {
        filter.rating = {
          [Op.gte]: [rating],
        };
      }
  
      if (min_price !== undefined && max_price !== undefined) {
        filter.price = {
          [Op.between]: [min_price, max_price],
        };
      }
  
      if (discount !== undefined) {
        filter.discount = {
          [Op.gte]: [discount],
        };;
      }
      
      if (Object.keys(filter).length !== 0) {
        products = await Product.findAll({
          where: {filter, id: userId},
          order: ["price"]
        });
      } else {
        products = await Product.findAll({
          where: {
            id: userId
          },order: ["price"],
        }); 
      }
  
      if (!products || products.length === 0) {
        return res.status(env.statuscode.notFound).json({ error: "No products found!" });
      }
    
      return res.status(env.success).json({ products: products });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = env.statuscode.internalServerError;
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
        return res.status(env.statuscode.notFound).json({ message: "No product found" });
      } else {
        return res.status(env.statuscode.success).json({ product: product });
      }
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = env.statuscode.internalServerError;
      }
      next(err);
    }
  };

  public updateProduct = async (req: TRequest<UpdateProductDto>, res: TResponse, next: NextFunction) => {
    const { productId } = req.params;
    const { title, imageUrl, price, description, category, rating, discount } = req.dto;
    const userId = req.user.id;

    try {
      const product = await Product.findByPk(productId);

      if (product?.dataValues.userId !== +userId!) {
        return res.status(env.statuscode.unAuthorized).json({ message: "user not authorized!" });
      }

      const updatedProduct = await Product.update(
        {
          title: title,
          imageUrl: imageUrl,
          price: price,
          description: description,
          category: category,
          rating: rating,
          discount: discount
        },
        {
          where: {
            id: productId,
          },
        },
      );
      if (!updatedProduct) {
        return res.status(env.statuscode.notFound).json({ message: "Failed to update product" });
      }
      return res.status(env.statuscode.success).json({ message: "Product Updated!" });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = env.statuscode.internalServerError;
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
        return res.status(env.statuscode.unAuthorized).json({ message: "user not authorized!" });
      }

      await product?.destroy();
      return res.status(env.statuscode.success).json({ message: "Product deleted!" });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = env.statuscode.internalServerError;
      }
      next(err);
    }
  };
}
