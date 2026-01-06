import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { CartItemSchema } from "./cartModel.js";
// const autoIncrement = require('mongoose-auto-increment');
// npm install --save --legacy-peer-deps mongoose-auto-increment
// const connection = mongoose.createConnection(process.env.DB_URI);
// autoIncrement.initialize(connection);

const orderSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "order must belong to user"],
    },
    cartItems: [CartItemSchema],
    shippingAddress: {
      address: String,
      phone: { type: String, required: true },
      city: { type: String, required: true },
      governorate: { type: String, required: true },
      apartment: String,
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
    },
    taxPrice: {
      type: Number,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      default: 0.0,
    },
    subTotal: {
      type: Number,
      default: 0.0,
    },
    totalOrderPrice: {
      type: Number,
      default: 0.0,
    },
    paymentMethodType: {
      type: String,
      enum: ["card", "cash"],
      default: "cash",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
  },
  { timestamps: true }
);

orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name profileImg email phone",
  }).populate({
    path: "cartItems.product",
    select: "title imageCover ratingsAverage ratingsQuantity variants",
  });

  next();
});

orderSchema.pre("save", function (next) {
  if (this.isNew && !this.publicId) {
    this.publicId = nanoid(10);
  }
  next();
});

// orderSchema.plugin(autoIncrement.plugin, {
//   model: "Order",
//   field: "id",
//   startAt: 1,
//   incrementBy: 1,
// });

const Order = mongoose.model("Order", orderSchema);
export default Order;
