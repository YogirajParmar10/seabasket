import { NextFunction } from "express";
import { TRequest, TResponse, enums } from "@types";
import { Product, Cart, CartItem, Reviews, Orders, OrderDetails, User } from "@entities";
import { CartDto, ReviewsDto, OrderDto, FilterProductDto } from "./dto";
import { Op } from "sequelize";
import Stripe from "stripe";
import {env} from "configs";

export class ShopController {
  public getShop = async (req: TRequest, res: TResponse, next: NextFunction) => {
    try {
      const products = await Product.findAll({ order: ["price"] });
      if (!products) {
        res.status(env.statuscode.notFound).json({ error: "No Products found!" });
      }
      return res.status(env.statuscode.success).json({ products: products });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = env.statuscode.internalServerError;
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
        return res.status(env.statuscode.notFound).json({ error: "No product found" });
      } else {
        return res.status(env.success).json({ product: product });
      }
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = env.statuscode.internalServerError;
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
        return res.status(env.statuscode.notFound).json({ error: "No product found !" });
      }

      return res.status(env.success).json({ products: products });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = env.statuscode.internalServerError;
      }
      next(err);
    }
  };

  public searchProduct = async (req: TRequest, res: TResponse, next: NextFunction) => {
    const { title } = req.query;
    const { category } = req.query;
    let products;

    if (!title && !category) {
      return res.status(400).json({ error: "search must include category or product title" });
    }

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
        return res.status(env.statuscode.notFound).json({ error: "No product found" });
      }
      return res.status(env.success).json({ products: products });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = env.statuscode.internalServerError;
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
        return res.status(env.statuscode.notFound).json({ error: "No categories found" });
      }

      const categoryList = categories.map(category => category.dataValues.category);

      return res.status(env.success).json({ categories: categoryList });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = env.statuscode.internalServerError;
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
        return res.status(env.statuscode.notFound).json({ error: "No trending products found" });
      }

      return res.status(env.success).json({ trendingProducts: trendingProducts });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = env.statuscode.internalServerError;
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

      return res.status(env.success).json({ Cart: userCart, totalPrice: totalPrice });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = env.statuscode.internalServerError;
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
        return res.status(env.statuscode.notFound).json({ error: "Product not found" });
      }

      const userCart = await Cart.findOne({ where: { userId: userId } });
      if (!userCart) {
        return res.status(env.statuscode.notFound).json({ error: "Cart not found for user" });
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
      return res.status(env.success).json({ message: "Product added to cart" });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = env.statuscode.internalServerError;
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
        return res.status(env.statuscode.notFound).json({ error: "Product not exist on this cart" });
      }

      await existingProduct.destroy();

      return res.status(env.success).json({ message: "Item removed" });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = env.statuscode.internalServerError;
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
        return res.status(env.statuscode.notFound).json("Product not found");
      }

      const postReview = await Reviews.create({
        review: review,
        userId: id,
        productId: productId,
      });

      if (!postReview) {
        return res.status(env.statuscode.internalServerError).json({ error: "Review not created" });
      }

      return res.status(env.success).json({ message: "Review posted" });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = env.statuscode.internalServerError;
      }
      next(err);
    }
  };

  public postOrder = async (req: TRequest<OrderDto>, res: TResponse, next: NextFunction) => {
    const { cartId } = req.dto;
    const userId = req.user.id;
    const lineItems = [];

    const userCart = await Cart.findByPk(userId);
 
    if(userCart.dataValues.id !== cartId){
      return res.status(env.unAuthorized).json({error:"user unauthorized" })
    }

    const stripe = new Stripe(env.stripePrivate);

    try {
      const cartItems = await CartItem.findAll({ where: { cartId: cartId }, attributes: ["productId", "quantity"] });
      
      if(!cartItems || cartItems.length === 0){
        return res.status(env.notFound).json({message: "Your cart is empty"})
      }
      
      for (const item of cartItems) {
        const productId = item.dataValues.productId;

        const product = await Product.findOne({ attributes: ["title", "price"], where: { id: productId } });

        lineItems.push({
            price_data: {
                currency: env.currency,
                product_data: {
                    name: product.dataValues.title,
                },
                unit_amount: product.dataValues.price * 100,
            },
            quantity: item.dataValues.quantity
        });
      }
      
      const checkout = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: lineItems.map(item => {         
          return {
            price_data: {
              currency: env.currency,
              product_data: {
                name: item.price_data.product_data.name, 
              },
              unit_amount: item.price_data.unit_amount,
            },
            quantity: item.quantity
          }
        }),
        success_url: env.stripeSuccess,
        cancel_url: env.stripeCancel
      });

      const checkoutUrl = checkout.url;

      const order = await Orders.create({
        userId: userId,
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
  
        return res.status(env.success).json({ message: "Order created", payment_link: checkoutUrl });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = env.statuscode.internalServerError;
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
          include: [
            {
              model: Product,
              attributes: ["price"],
            },
          ],
        },
      });
      if (!orders || orders.length === 0) {
        return res.status(env.statuscode.notFound).json({ message: "You haven't ordered yet!" });
      }

      return res.status(env.success).json(orders);
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = env.statuscode.internalServerError;
      }
      next(err);
    }
  };

  public getOrderDetail = async (req: TRequest, res: TResponse, next: NextFunction) => {
    const orderId = req.params.orderId;
    const action = req.query.action;
    const userId = req.user.id;
    let totalPrice = 0;

    try {
      const order = await Orders.findByPk(orderId);

      if (order.dataValues.userId !== userId) {
        return res.status(env.statuscode.unAuthorized).json({ message: "unAuthorized" });
      }
      if (action === "cancel") {
        const order = await Orders.update(
          {
            status: enums.OrderStatus.Cancelled,
            isCancelled: true,
          },
          { where: { id: orderId } },
        );
        if (!order) {
          return res.status(env.statuscode.internalServerError).json({ error: "Internal Server error" });
        } else {
          return res.status(env.success).json({ message: "Order cancelled" });
        }
      } else {
        const orderDetails = await OrderDetails.findAll({
          where: { orderId: orderId },
          attributes: ["productId", "quantity"],
          include: [
            {
              model: Product,
              attributes: ["price"],
            },
          ],
        });

        if (!orderDetails || orderDetails.length === 0) {
          return res.status(env.statuscode.notFound).json({ message: "No order found!" });
        }

        orderDetails.forEach(orderDetail => {
          totalPrice += orderDetail.dataValues.quantity * orderDetail.dataValues.product.price;
        });

        const orderStatus = await Orders.findOne({
          where: { id: orderId },
          attributes: ["status"],
        });

        return res.status(env.success).json({ orderStatus, orderDetails, totalPrice });
      }
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = env.statuscode.internalServerError;
      }
      next(err);
    }
  };
}
