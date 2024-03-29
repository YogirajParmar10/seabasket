import { NextFunction, Request, Response } from "express";
import { TRequest, TResponse } from "@types";
import { Product, Cart, CartItem, Reviews, Orders, OrderDetails } from "entities";
import { CartDto, ProductByCategoryDto, SearchProductDto, ReviewsDto, OrderDto } from "./dto";
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

  public filterProduct = async (req: TRequest<ProductByCategoryDto>, res: TResponse, next: NextFunction) => {
    const category = req.params.category;

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
    const { title } = req.dto;

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

    try {
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
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };

  public addToCart = async (req: TRequest<CartDto>, res: TResponse, next: NextFunction) => {
    const userId = req.me.id;
    const { productId, quantity } = req.dto;

    try {
      const product = await Product.findOne({ where: { id: productId } });
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const userCart = await Cart.findOne({ where: { userId: userId } });
      if (!userCart) {
        return res.status(404).json({ error: "Cart not found for user" });
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
      return res.status(200).json({ message: "Product added to cart" });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };

  public removeItemFromCart = async (req: TRequest, res: TResponse, next: NextFunction) => {
    const userId = req.me.id;
    const productId = req.body.productId;

    try {
      const cart = await Cart.findOne({ where: { userId: userId } });
      const cartId = cart.dataValues.id;

      const existingProduct = await CartItem.findOne({ where: { productId: productId, cartId: cartId } });

      if (!existingProduct) {
        return res.status(404).json({ error: "Product not exist on this cart" });
      }

      await existingProduct.destroy();

      return res.status(200).json({ message: "Item removed" });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };

  public getReviews = async (req: TRequest, res: TResponse, next: NextFunction) => {
    const { productId } = req.params;

    try {
      const product = await Product.findByPk(productId);

      if (!product) {
        return res.status(404).json("Product not found");
      }

      const reviews = await Reviews.findAll({ where: { productId: productId } });

      const rating = product.dataValues.rating;

      if (!reviews || reviews.length == 0) {
        return res.status(404).json({ message: "No reviews found for this product" });
      }
      return res.status(200).json({
        message: `Reviews for ${productId}`,
        rating: rating,
        reviews: reviews,
      });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };

  public postReviews = async (req: TRequest<ReviewsDto>, res: TResponse, next: NextFunction) => {
    const { review } = req.dto;
    const { productId } = req.params;
    const { id } = req.me;

    try {
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
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };

  public postOrder = async (req: TRequest<OrderDto>, res: TResponse, next: NextFunction) => {
    const { cartId } = req.dto;
    const userId = req.me.id;

    try {
      const cartItems = await CartItem.findAll({ where: { cartId: cartId }, attributes: ["productId", "quantity"] });

      const order = await Orders.create({
        userId: userId,
        status: "Order confirmed",
      });

      const orderId = order.dataValues.id;

      await Promise.all([
        ...cartItems.map(async product => {
          let productId = product.dataValues.productId;
          let quantity = product.dataValues.quantity;
          await OrderDetails.create({
            orderId: orderId,
            productId: productId,
            quantity: quantity,
          });
        }),
        ...cartItems.map(async Item => {
          const productId = Item.dataValues.productId;
          await CartItem.destroy({ where: { productId: productId } });
        }),
      ]);

      return res.status(200).json({ message: "Order created!" });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };

  public getOrders = async (req: TRequest, res: TResponse, next: NextFunction) => {
    const userId = req.me.id;

    try {
      const orders = await Orders.findAll({
        where: { userId: userId },
        attributes: ["id", "isCancelled", "status"],
        include: {
          model: OrderDetails,
          attributes: ["productId", "quantity"],
        },
      });
      return res.status(200).json(orders);
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };

  public getOrderDetail = async (req: TRequest, res: TResponse, next: NextFunction) => {
    const orderId = req.params.orderId;

    try {
      const order = await OrderDetails.findAll({
        where: { orderId: orderId },
        attributes: ["productId", "quantity", "createdAt"],
      });

      const orderStatus = await Orders.findOne({ where: { id: orderId }, attributes: ["status"] });

      if (!order) {
        return res.status(404).json({ message: "No order found!" });
      }

      return res.status(200).json({ orderStatus, order });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };
}
