import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please set your name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "Please set your email"],
      unique: [true, "Email already in use"],
      lowercase: true, // transform it to lowercase in the validation layer
    },
    phone: String,
    image: String,
    password: {
      type: String,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    passwordResetCode: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    resetCodeVerified: {
      type: Boolean,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "manager", "admin"],
      default: "user",
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
      select: false,
    },
    wishlist: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    ],
    addresses: [
      {
        id: { type: mongoose.Schema.Types.ObjectId },
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
    ],
  },
  { timestamps: true }
);

// Document Middleware that automatically run before save user document
userSchema.pre("save", async function (next) {
  // Initialize isDeleted to false if not provided
  // undefined != false when you don't provide it
  if (this.isNew) this.isDeleted = false;
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();
  // Hash the password with the cost 12
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

const User = mongoose.model("User", userSchema);

export default User;
