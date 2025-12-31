// eslint-disable-next-line import/no-import-module-exports
import mongoose from "mongoose";

// eslint-disable-next-line import/no-import-module-exports
import { generateSku } from "../utils/generateSku.js";

const VariantSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    attributes: { type: Map, of: String, required: true },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    priceAfterDiscount: {
      type: Number,
      min: 0,
      validate: {
        validator: function (value) {
          return !value || value < this.price;
        },
        message: "Discounted price must be less than original price",
      },
    },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: [
      {
        url: {
          type: String,
          required: true,
          trim: true,
        },
        id: String,
        alt: String,
      },
    ],
    sold: {
      type: Number,
      default: 0,
    },
  },
  { _id: false, timestamps: true }
);
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Product title is required"],
      minlength: [3, "Too short product title"],
      maxlength: [100, "Too long product title"],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [2000, "Too long description"],
    },

    imageCover: {
      type: {
        url: {
          type: String,
          required: true,
        },
        id: String,
      },
      required: [true, "Product Image cover is required"],
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "Product must be belong to a category"],
    },
    subcategory: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "SubCategory",
      },
    ],
    brand: {
      type: mongoose.Schema.ObjectId,
      ref: "Brand",
    },
    ratingsAverage: {
      type: Number,
      // default: 0,
      min: [1, "Rating must be above or equal 1.0"],
      max: [5, "Rating must be below or equal 5.0"],
      set: (val) => Math.round(val * 10) / 10, // 3.6666 * 10 = 36.666  = 37 = 3.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
          trim: true,
        },
        id: String,
        alt: String,
      },
    ],
    options: [
      {
        name: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["color", "text", "image", "size"],
          default: "text",
        },
        values: {
          type: [String],
          required: true,
        },
      },
    ],
    variants: [VariantSchema],
    isFreeShipping: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // Remove fields that you don't want to expose
        delete ret.isDeleted;
        return ret;
      },
    },
    toObject: { virtuals: true },
    timestamps: true,
  }
);
// Virtual for total sold across all variants
productSchema.virtual("TotalSold").get(function () {
  return (
    this.variants.reduce((total, variant) => total + (variant.sold || 0), 0) + 0
  );
});
productSchema.virtual("TotalStock").get(function () {
  return (
    this.variants.reduce((total, variant) => total + (variant.stock || 0), 0) +
    0
  );
});
productSchema.pre("validate", function (next) {
  if (this.isNew || !this.sku) {
    this.variants.map((v) => {
      v.sku = `PROD-${generateSku()}`;
      return v;
    });
  }

  next();
});
// Virtual populate: populate review on the product (review pointing to the product not the product pointing to the review) the parent (product) does not know about the child (review)
productSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id",
});
productSchema.pre(/^find/, function (next) {
  const projection = this.projection();
  const isInclusive = this.selectedInclusively();
  const populatedModels = ["brand", "subcategory", "category"];

  populatedModels.forEach((model) => {
    if (!isInclusive || projection[model]) {
      this.populate(model);
    }
  });

  next();
});
productSchema.index({ title: "text", description: "text" });
productSchema.index({ category: 1, isActive: 1, ratingsAverage: -1 });
export default mongoose.model("Product", productSchema);

// const setImageUrl = (doc) => {
//   if (doc.imageCover) {
//     const imageCoverUrl = `${process.env.BASE_URL}/products/${doc.imageCover}`;
//     doc.imageCover = imageCoverUrl;
//   }
//   if (doc.images) {
//     const images = [];
//     doc.images.forEach((image) => {
//       const imageUrl = `${process.env.BASE_URL}/products/${image}`;
//       images.push(imageUrl);
//     });
//     doc.images = images;
//   }
// };

// productSchema.post('save', (doc) => {
//   setImageUrl(doc);
// });
