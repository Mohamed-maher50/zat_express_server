const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");

// @desc      Add product to cart
// @route     POST /api/v1/cart
// @access    Private/User
exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, variantSku, quantity } = req.body;

  const product = await Product.findById(productId, { isDeleted: false });
  if (!product)
    return next(new ApiError(`No Product found for this id: ${productId}`));

  const variant = product.variants.find((v) => v.sku === variantSku);
  if (!variant)
    return next(
      new ApiError(`No Product variant found for this id: ${variantSku}`)
    );
  const availableQuantity = quantity > variant.stock ? variant.stock : quantity;
  // 1) Check if there is cart for logged user
  let cart = await Cart.findOne({ user: req.user._id });

  if (cart) {
    // 2) check if product exists with same variant for user cart
    const itemIndex = cart.items.findIndex(
      (p) =>
        p.product._id.toString() === req.body.productId &&
        p.variantSku === variantSku
    );
    if (itemIndex > -1) {
      // if it exist increase quantity
      const item = cart.items[itemIndex];
      item.quantity = quantity > variant.stock ? variant.stock : quantity;
    } else {
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
    // cart = await cart.save();
    // return res.status(201).send(cart);
  }
  if (!cart) {
    //no cart for user, create new cart
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

  // cart.totalCartPrice = totalPrice;
  cart = await cart.save();

  // Calculate total cart price

  return res.status(200).json({
    status: "success",
    message: "Product added successfully to your cart",
    numOfCartItems: cart.items.length,
    data: cart,
  });
});

// @desc      Update product quantity
// @route     Put /api/v1/cart/:itemId
// @access    Private/User
exports.updateCartProductCount = asyncHandler(async (req, res, next) => {
  const { sku } = req.params;
  const { quantity: count } = req.body;
  // 1) Check if there is cart for logged user
  let cart = await Cart.findOne({ user: req.user._id }).populate({
    path: "items.product",
    select: " variants ",
  });

  if (!cart) {
    return next(
      new ApiError(`No cart exist for this user: ${req.user._id}`, 404)
    );
  }

  // 2) check if product exists with same variant for user cart
  const itemIndex = cart.items.findIndex((p) => sku === p.variantSku);
  if (itemIndex > -1) {
    const variant = cart.items[itemIndex].product.variants.find(
      (v) => v.sku === sku
    );
    if (!variant)
      return next(new ApiError(`No Product variant found for this id: ${sku}`));
    // if it exist increase quantity
    const item = cart.items[itemIndex];
    item.quantity = count > variant.stock ? variant.stock : count;
  } else {
    return next(new ApiError(`No Product Cart item found for this id: ${sku}`));
  }
  // Calculate total cart price
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
exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
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
// @route     DELETE /api/v1/cart/:itemId
// @access    Private/User
exports.removeCartProduct = asyncHandler(async (req, res, next) => {
  const { sku } = req.params;
  let cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { items: { variantSku: sku } },
    },
    { new: true }
  );

  // Calculate total cart price
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
exports.clearLoggedUserCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user._id });

  res.status(204).send();
});

// @desc      Apply coupon logged user cart
// @route     PUT /api/v1/cart/applyCoupon
// @access    Private/User
exports.applyCouponToCart = asyncHandler(async (req, res, next) => {
  const { couponName } = req.body;

  // 2) Get current user cart
  let cart = await Cart.findOne({ user: req.user._id });

  // 1) Get coupon based on it's unique name and expire > date.now
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

// update cartItem quantity
