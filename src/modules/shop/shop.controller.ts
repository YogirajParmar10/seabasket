import { NextFunction, Request, Response } from "express";
import { TRequest, TResponse } from "@types";
import { Product, Cart, CartItem, Reviews } from "entities";
import { CartDto, ProductByCategoryDto, SearchProductDto } from "./dto";
import { Op } from "sequelize";
import { ReviewsDto } from "./dto/review.dto";

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
  public getCart = async (req: TRequest, res: TResponse, next: NextFunction) => {
    const userId = req.me.id;

    const userCart = await Cart.findOne({
      where: { userId: userId },
      attributes: ["id"],
      include: [
        {
          model: CartItem,
          attributes: ["quantity"],
          include: [
            {
              model: Product,
              attributes: ["id", "title", "price", "imageUrl"],
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

  public addToCart = async (req: TRequest<CartDto>, res: TResponse, next: NextFunction) => {
    const userId = req.me.id;
    const { productId, quantity } = req.dto;

    const product = await Product.findOne({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const userCart = await Cart.findOne({ where: { userId: userId } });

    if (!userCart) {
      return { error: "Cart not found for user" };
    }

    const cartId = userCart.dataValues.id;

    const cartItem = await CartItem.findOne({ where: { cartId: cartId, productId: productId } });

    if (cartItem) {
      const updatedQuantity = cartItem.dataValues.quantity + quantity;

      await CartItem.update(
        { quantity: updatedQuantity },
        {
          where: {
            id: cartItem.dataValues.id,
          },
        },
      );
    } else {
      const addToCart = await CartItem.create({
        productId: productId,
        cartId: cartId,
        quantity: quantity,
      });
      if (!addToCart) {
        return { error: "Add to cart failed" };
      }
    }
    res.status(200).json({ message: "Product added to cart" });
  };

  public removeItemFromCart = async (req: TRequest, res: TResponse, next: NextFunction) => {
    const userId = req.me.id;
    const productId = req.body.productId;

    const cart = await Cart.findOne({ where: { userId: userId } });
    const cartId = cart.dataValues.id;

    const existingProduct = await CartItem.findOne({ where: { productId: productId, cartId: cartId } });

    if (!existingProduct) {
      return res.status(400).json({ message: "Product not exist on this cart" });
    }

    await existingProduct.destroy();

    return res.status(200).json({ message: "Item removed" });
  };
  public updateCart = async (req: TRequest<CartDto>, res: TResponse, next: NextFunction) => {
    const userId = req.me.id;
    const { productId, quantity } = req.dto;

    const product = await Product.findOne({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const userCart = await Cart.findOne({ where: { userId: userId } });

    if (!userCart) {
      return { error: "Cart not found for user" };
    }

    const cartId = userCart.dataValues.id;

    const cartItem = await CartItem.findOne({ where: { cartId: cartId, productId: productId } });

    if (cartItem) {
      const updatedQuantity = cartItem.dataValues.quantity + quantity;

      await CartItem.update(
        { quantity: updatedQuantity },
        {
          where: {
            id: cartItem.dataValues.id,
          },
        },
      );

      return res.status(200).json({ message: "Cart item updated" });
    } else {
      return res.status(404).json("Product not in cart");
    }
  };

  public getReviews = async (req: TRequest, res: TResponse, next: NextFunction) => {
    const productId = req.params.productId;

    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json("Product not found");
    }

    const reviews = await Reviews.findAll({ where: { productId: productId } });

    const rating = product.dataValues.rating;
    console.log(reviews);

    if (!reviews || reviews.length == 0) {
      return res.status(404).json({ message: "No reviews found for this product" });
    }
    return res.status(200).json({
      message: `Reviews for ${productId}`,
      rating: rating,
      reviews: reviews,
    });
  };

  public postReviews = async (req: TRequest<ReviewsDto>, res: TResponse, next: NextFunction) => {
    const { review } = req.dto;
    const { productId } = req.params;
    const { id } = req.me;

    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json("Product not found");
    }

    const postReview = await Reviews.create({
      review: review,
      userId: id,
      productId: productId,
    });
    if (!postReview) {
      return res.status(500).json("Review not created");
    }
    return res.status(200).json({ message: "Review posted" });
  };
}
