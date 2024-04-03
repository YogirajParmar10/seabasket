import { NextFunction } from "express";
import { TRequest, TResponse } from "@types";
import { Product, Cart, CartItem, Reviews, Orders, OrderDetails, User } from "entities";
import { CartDto, ReviewsDto, OrderDto, FilterProductDto } from "./dto";
import { Op } from "sequelize";
import { enums } from "@types";

export class ShopController {
  public getShop = async (req: TRequest, res: TResponse, next: NextFunction) => {
    try {
      const products = await Product.findAll({ order: ["price"] });
      if (!products) {
        res.status(404).json({ error: "No Products found!" });
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
      const product = await Product.findByPk(productId, {
        attributes: ["id", "title", "imageUrl", "price", "description", "rating", "discount", "category", "userId"],
        include: [
          {
            model: Reviews,
            attributes: ["review"],
            include: [
              {
                model: User,
                attributes: ["name"],
              },
            ],
          },
        ],
      });
      if (!product) {
        return res.status(404).json({ error: "No product found" });
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

  public filterProduct = async (req: TRequest<FilterProductDto>, res: TResponse, next: NextFunction) => {
    const { category, max_price, min_price, rating, discount } = req.query;
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
        },
      });

      if (!products || products.length === 0) {
        return res.status(404).json({ error: "No product found !" });
      }

      return res.status(200).json({ products: products });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };

  public searchProduct = async (req: TRequest, res: TResponse, next: NextFunction) => {
    const { title } = req.query;
    const { category } = req.query;
    let products;

    try {
      if (title) {
        products = await Product.findAll({
          where: {
            title: {
              [Op.like]: `%${title}%`,
            },
          },
        });
      } else {
        products = await Product.findAll({
          where: {
            category: category,
          },
        });
      }

      if (!products || products.length === 0) {
        return res.status(404).json({ error: "No product found" });
      }
      return res.status(200).json({ products: products });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };

  public getCategoryList = async (req: TRequest, res: TResponse, next: NextFunction) => {
    try {
      const categories = await Product.findAll({
        attributes: ["category"],
        group: ["category"],
      });

      if (!categories || categories.length === 0) {
        return res.status(404).json({ error: "No categories found" });
      }

      const categoryList = categories.map(category => category.dataValues.category);

      return res.status(200).json({ categories: categoryList });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };

  public getTrendingProducts = async (req: TRequest, res: TResponse, next: NextFunction) => {
    try {
      const trendingProducts = await Product.findAll({
        where: {
          rating: { [Op.gte]: 4 },
        },
        limit: 10,
        order: [["updatedAt", "DESC"]],
      });

      if (!trendingProducts || trendingProducts.length === 0) {
        return res.status(404).json({ error: "No trending products found" });
      }

      return res.status(200).json({ trendingProducts: trendingProducts });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };

  public getCart = async (req: TRequest, res: TResponse, next: NextFunction) => {
    const userId = req.user.id;
    let totalPrice = 0;

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

      await userCart.dataValues.cartItems.forEach((cartItem: any) => {
        totalPrice += cartItem.quantity * cartItem.product.price;
      });

      if (userCart.dataValues.cartItems.length == 0) {
        return res.json({ cart: userCart, message: "cart is empty" });
      }

      return res.status(200).json({ Cart: userCart, totalPrice: totalPrice });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };

  public addToCart = async (req: TRequest<CartDto>, res: TResponse, next: NextFunction) => {
    const userId = req.user.id;
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
    const userId = req.user.id;
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

  public postReviews = async (req: TRequest<ReviewsDto>, res: TResponse, next: NextFunction) => {
    const { review } = req.dto;
    const { productId } = req.params;
    const { id } = req.user;

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
        return res.status(500).json({ error: "Review not created" });
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
    const userId = req.user.id;

    try {
      const cartItems = await CartItem.findAll({ where: { cartId: cartId }, attributes: ["productId", "quantity"] });

      const order = await Orders.create({
        userId: userId,
        status: enums.OrderStatus.Confirmed,
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
    const userId = req.user.id;

    try {
      const orders = await Orders.findAll({
        where: { userId: userId },
        attributes: ["id", "isCancelled", "status"],
        include: {
          model: OrderDetails,
          attributes: ["productId", "quantity"],
        },
      });
      if (!orders) {
        return res.status(404).json({ message: "You haven't ordered yet!" });
      }
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
    const action = req.query.action;

    try {
      if (action === "cancel") {
        const order = await Orders.update(
          {
            status: enums.OrderStatus.Cancelled,
            isCancelled: true,
          },
          { where: { id: orderId } },
        );
        if (!order) {
          return res.status(500).json({ error: "Internal Server error" });
        } else {
          return res.status(200).json({ message: "Order cancelled" });
        }
      } else {
        const order = await OrderDetails.findAll({
          where: { orderId: orderId },
          attributes: ["productId", "quantity", "createdAt"],
        });

        if (!order) {
          return res.status(404).json({ message: "No order found!" });
        }
        const orderStatus = await Orders.findOne({ where: { id: orderId }, attributes: ["status"] });
        return res.status(200).json({ orderStatus, order });
      }
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };
}
