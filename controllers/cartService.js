import asyncHandler from "express-async-handler";

import ApiError from "../utils/apiError.js";
import Product from "../models/productModel.js";
import Cart from "../models/cartModel.js";
import Coupon from "../models/couponModel.js";

// @desc      Add product to cart
// @route     POST /api/v1/cart
// @access    Private/User
export const addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, variantSku, quantity } = req.body;

  const product = await Product.findById(productId, { isDeleted: false });
  if (!product) {
    return next(
      new ApiError(`No Product found for this id: ${productId}`, 404)
    );
  }

  const variant = product.variants.find((v) => v.sku === variantSku);
  if (!variant) {
    return next(
      new ApiError(`No Product variant found for this sku: ${variantSku}`, 404)
    );
  }

  const availableQuantity = quantity > variant.stock ? variant.stock : quantity;

  // Check if cart exists for logged user
  let cart = await Cart.findOne({ user: req.user._id });

  if (cart) {
    // Check if product with same variant exists in cart
    const itemIndex = cart.items.findIndex(
      (p) =>
        p.product._id.toString() === productId && p.variantSku === variantSku
    );

    if (itemIndex > -1) {
      // Update quantity if item exists
      const item = cart.items[itemIndex];
      item.quantity = quantity > variant.stock ? variant.stock : quantity;
    } else {
      // Add new item if it doesn't exist
      cart.items.push({
        product: product._id,
        variantSku,
        quantity: availableQuantity,
        price: variant.price,
        image: variant.images[0].url,
        variant: {
          sku: variant.sku,
          attributes: variant.attributes,
        },
      });
    }
  } else {
    // Create new cart if it doesn't exist
    cart = await Cart.create({
      user: req.user._id,
      items: [
        {
          quantity: availableQuantity,
          product: productId,
          variantSku,
          price: variant.price,
          image: variant.images[0].url,
          variant: {
            sku: variant.sku,
            attributes: variant.attributes,
          },
        },
      ],
    });
    cart = await cart.populate("items.product");
  }

  cart = await cart.save();

  return res.status(200).json({
    status: "success",
    message: "Product added successfully to your cart",
    numOfCartItems: cart.items.length,
    data: cart,
  });
});

// @desc      Update product quantity in cart
// @route     PUT /api/v1/cart/:sku
// @access    Private/User
export const updateCartProductCount = asyncHandler(async (req, res, next) => {
  const { sku } = req.params;
  const { quantity: count } = req.body;

  // Check if cart exists for logged user
  let cart = await Cart.findOne({ user: req.user._id }).populate({
    path: "items.product",
    select: "variants",
  });

  if (!cart) {
    return next(
      new ApiError(`No cart exist for this user: ${req.user._id}`, 404)
    );
  }

  // Find item with matching variant SKU
  const itemIndex = cart.items.findIndex((p) => sku === p.variantSku);
  if (itemIndex > -1) {
    const variant = cart.items[itemIndex].product.variants.find(
      (v) => v.sku === sku
    );
    if (!variant) {
      return next(
        new ApiError(`No Product variant found for sku: ${sku}`, 404)
      );
    }

    // Update quantity with stock limit
    const item = cart.items[itemIndex];
    item.quantity = count > variant.stock ? variant.stock : count;
  } else {
    return next(
      new ApiError(`No Product cart item found for sku: ${sku}`, 404)
    );
  }

  cart = await cart.save();
  cart.depopulate("items.product");

  return res.status(200).json({
    status: "success",
    numOfCartItems: cart.items.length,
    data: cart,
  });
});

// @desc      Get logged user cart
// @route     GET /api/v1/cart
// @access    Private/User
export const getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(
      new ApiError(`No cart exist for this user: ${req.user._id}`, 404)
    );
  }

  return res.status(200).json({
    status: "success",
    numOfCartItems: cart.items.length,
    data: cart,
  });
});

// @desc      Remove product from cart
// @route     DELETE /api/v1/cart/:sku
// @access    Private/User
export const removeCartProduct = asyncHandler(async (req, res, next) => {
  const { sku } = req.params;

  let cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { items: { variantSku: sku } },
    },
    { new: true }
  );

  if (!cart) {
    return next(
      new ApiError(`No cart exist for this user: ${req.user._id}`, 404)
    );
  }

  cart = await cart.save();

  return res.status(200).json({
    status: "success",
    numOfCartItems: cart.items.length,
    data: cart,
  });
});

// @desc      Clear logged user cart
// @route     DELETE /api/v1/cart
// @access    Private/User
export const clearLoggedUserCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.status(204).send();
});

// @desc      Apply coupon to logged user cart
// @route     PUT /api/v1/cart/applyCoupon
// @access    Private/User
export const applyCouponToCart = asyncHandler(async (req, res, next) => {
  const { couponName } = req.body;

  // Get current user cart
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(
      new ApiError(`No cart exist for this user: ${req.user._id}`, 404)
    );
  }

  // Get coupon by name and check if it's valid and not expired
  const coupon = await Coupon.findOne({
    name: couponName,
    expire: { $gt: Date.now() },
    active: true,
  });

  if (!coupon) {
    return next(new ApiError("Coupon is invalid or has expired", 400));
  }

  cart.coupon = coupon.name;
  cart.couponValue = coupon.discount;
  cart = await cart.save();

  return res.status(200).json({
    status: "success",
    numOfCartItems: cart.items.length,
    coupon: coupon.name,
    data: cart,
  });
});
