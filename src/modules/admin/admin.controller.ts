import { NextFunction, Request, Response } from "express";
import { TRequest, TResponse } from "@types";
import Product from "entities/product.entity";
import { CreateProductDto, ProductByCategoryDto, UpdateProductDto } from "./dto";

export class AdminController {
  public createProduct = async (req: TRequest<CreateProductDto>, res: TResponse, next: NextFunction) => {
    const { title, imageUrl, price, description, category } = req.dto;
    const userId = req.me.id;

    try {
      const prod = await Product.create({
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
        err.statusCode = 500;
      }
      next(err);
    }
  };

  public getAllProducts = async (req: TRequest, res: TResponse, next: NextFunction) => {
    const userId = req.me.id;
    try {
      const products = await Product.findAll({ where: { userId: userId }, order: ["price"] });
      if (!products) {
        const error = new Error("No products found!");
        throw error;
      }
      const prod = [];
      for (let index = 0; index < products.length; index++) {
        prod.push(products[index].dataValues);
      }
      prod.sort((a, b) => a.price - b.price);
      return res.status(200).json({ product: prod });
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

  public updateProduct = async (req: TRequest<UpdateProductDto>, res: TResponse, next: NextFunction) => {
    const { prodId } = req.params;
    const { title, imageUrl, price, description, category } = req.dto;
    const userId = req.me.id;

    const prod = await Product.findByPk(prodId);

    if (prod?.dataValues.userId !== +userId!) {
      return res.status(401).json({ message: "user not authorized!" });
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
          id: prodId,
        },
      },
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "Failed to update product" });
    }
    return res.status(200).json({ message: "Product Updated!" });
  };

  public deleteProduct = async (req: TRequest<UpdateProductDto>, res: TResponse, next: NextFunction) => {
    const { prodId } = req.params;
    const userId = req.me.id;

    const prod = await Product.findByPk(prodId);

    if (prod?.dataValues.userId !== +userId!) {
      return res.status(401).json({ message: "user not authorized!" });
    }

    await prod?.destroy();
    return res.status(200).json({ message: "Product deleted!" });
  };
}
