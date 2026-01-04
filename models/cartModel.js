// eslint-disable-next-line import/no-import-module-exports
import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: true,
    },
    variantSku: {
      type: String,
      required: [true, "Variant SKU is required"],
    },
    title: {
      type: String,
      required: true,
    },
    image: String,
    variant: {
      sku: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
      },
      attributes: { type: Map, of: String, required: true },
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
      default: 1,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    // snapshot prices
    price: {
      type: Number,
      required: true,
    },
    priceAfterDiscount: {
      type: Number,
    },
  },
  { _id: false, timestamps: true }
);

const cartSchema = new mongoose.Schema(
  {
    // cartItems
    items: [CartItemSchema],
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    subtotal: {
      type: Number,
      default: 0,
    },
    coupon: String,
    couponValue: Number,
    totalPriceAfterDiscount: {
      type: Number,
    },
  },
  { timestamps: true }
);
cartSchema.pre("validate", function (next) {
  this.items.forEach((item) => {
    item.subtotal = item.price * item.quantity;
  });
  next();
});
cartSchema.pre("save", function (next) {
  this.subtotal = this.items.reduce(
    (total, item) => total + (item.subtotal || 0),
    0
  );

  if (this.coupon && this.couponValue > 0) {
    this.discount = (this.subtotal * this.couponValue) / 100;
    this.totalPriceAfterDiscount = Math.max(0, this.subtotal - this.discount);
  } else {
    this.discount = 0;
    this.totalPriceAfterDiscount = this.subtotal;
  }

  this.subtotal = parseFloat(this.subtotal.toFixed(2));
  this.discount = parseFloat(this.discount.toFixed(2));
  this.totalPriceAfterDiscount = parseFloat(
    this.totalPriceAfterDiscount.toFixed(2)
  );

  next();
});
// cartSchema.pre(/^find/, function (next) {
// this.populate({
//   path: 'products.product',
//   populate: { path: 'category', select: 'name', model: 'Category' },
// }).populate({
//     path: 'products.product',
//     populate: { path: 'brand', select: 'name', model: 'Brand' },
//   });
//   next();
// });
const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
export { CartItemSchema };
