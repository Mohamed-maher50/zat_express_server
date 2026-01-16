import asyncHandler from "express-async-handler";
import Stripe from "stripe";

import ApiError from "../utils/apiError.js";
import * as factory from "./handlersFactory.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Cart from "../models/cartModel.js";
import Order from "../models/orderModel.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Create new cash order
// @route   POST /api/v1/orders/:cartId
// @access  Private/User
export const createCashOrder = asyncHandler(async (req, res, next) => {
  const taxPrice = 0;
  const shippingPrice = 0;

  // Get logged user cart
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`There is no cart for this user: ${req.user._id}`, 404)
    );
  }

  // Calculate cart price (with or without coupon discount)
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.subtotal;

  // Create order with cash payment option
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.items,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice: taxPrice + shippingPrice + cartPrice,
    subtotal: cart.subtotal,
  });

  // Update product quantities and sales count
  const updateQueries = cart.items.map((item) =>
    Product.updateOne(
      { "variants.sku": item.variantSku },
      {
        $inc: {
          "variants.$.stock": -Number(item.quantity),
          "variants.$.sold": Number(item.quantity),
        },
      }
    )
  );

  if (order) {
    await Promise.all(updateQueries);
    // Clear cart after order creation
    await Cart.findByIdAndDelete(req.params.cartId);
  }

  res.status(201).json({ status: "success", data: order });
});

// @desc    Get specific order by ID
// @route   GET /api/v1/orders/:id
// @access  Private/User-Admin
export const getSpecificOrder = factory.getOne(Order);

// @desc    Filter orders for logged user
// @route   Middleware for GET /api/v1/orders
// @access  Private/User
export const filterOrdersForLoggedUser = asyncHandler(
  async (req, res, next) => {
    if (req.user.role === "user") {
      req.filterObject = { user: req.user._id };
    }
    next();
  }
);

// @desc    Get all orders
// @route   GET /api/v1/orders
// @access  Private/User-Admin
export const getAllOrders = factory.getAll(Order);

// @desc    Update order status to paid
// @route   PUT /api/v1/orders/:id/pay
// @access  Private/User-Admin
export const updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      new ApiError(`There is no order for this id: ${req.params.id}`, 404)
    );
  }

  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({
    status: "success",
    data: updatedOrder,
  });
});

// @desc    Update order status to delivered
// @route   PUT /api/v1/orders/:id/deliver
// @access  Private/Admin
export const updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      new ApiError(`There is no order for this id: ${req.params.id}`, 404)
    );
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({
    status: "success",
    data: updatedOrder,
  });
});

// @desc    Create checkout session for Stripe payment
// @route   GET /api/v1/orders/checkout/:cartId
// @access  Private/User
export const checkoutSession = asyncHandler(async (req, res, next) => {
  // Get the current cart
  const cart = await Cart.findById(req.params.cartId).populate("items.product");
  if (!cart) {
    return next(
      new ApiError(`There is no cart for this user: ${req.user._id}`, 404)
    );
  }

  let coupon;
  if (cart.coupon) {
    coupon = await stripe.coupons.create({
      percent_off: cart.couponValue,
      currency: "egp",
      duration: "once",
    });
  }

  const lineItems = cart.items.map((e) => ({
    quantity: e.quantity,
    price_data: {
      currency: "egp",
      unit_amount_decimal: e.price * 100,
      product_data: {
        name: e.product.title,
        description: e.product.description,
        images: e.product.images.map((i) => i.url),
      },
    },
  }));
  const discounts = coupon
    ? [
        {
          coupon: coupon.id,
        },
      ]
    : [];
  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: lineItems,

    mode: "payment",
    success_url: `${process.env.STRIPE_SUCCESS_URL || "http://localhost:3000"}`,
    cancel_url: `${process.env.STRIPE_SUCCESS_URL || "http://localhost:3000"}`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
    discounts,
  });

  res.status(200).json({
    status: "success",
    session,
  });
});
// @desc    Create order after successful Stripe payment
// @route   Internal function called by webhook
const createOrderCheckout = async (session, next) => {
  const cartId = session.client_reference_id;
  const checkoutAmount = session.amount_total / 100; // Convert from cents
  const shippingAddress = session.metadata;
  // Get cart and user
  const cart = await Cart.findById(cartId);
  const user = await User.findOne({ email: session.customer_email });
  if (!cart || !user) {
    throw new Error("Cart or user not found");
  }
  // Create order
  const order = await Order.create({
    user: user._id,
    cartItems: cart.items,
    shippingAddress,
    totalOrderPrice: checkoutAmount,
    paymentMethodType: "card",
    isPaid: true,
    paidAt: Date.now(),
  });

  // Update product quantities and sales count
  if (order) {
    const bulkOption = cart.items.map((item) => ({
      updateOne: {
        filter: { "variants.sku": item.variantSku },
        update: {
          $inc: {
            "variants.$.stock": -item.quantity,
            "variants.$.sold": item.quantity,
          },
        },
      },
    }));

    await Product.bulkWrite(bulkOption);

    // Clear cart after order creation
    await Cart.findByIdAndDelete(cartId);
  }

  return order;
};

// @desc    Webhook handler for Stripe payment completion
// @route   POST /webhook-checkout
// @access  From Stripe
export const webhookCheckout = (req, res, next) => {
  const signature = req.headers["stripe-signature"].toString();
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }
  // Handle successful checkout session
  if (event.type === "checkout.session.completed") {
    console.log("work");
    createOrderCheckout(event.data.object).catch((err) => {
      console.error("Error creating order from webhook:", err);
    });
  }

  res.status(200).json({ received: true });
};
