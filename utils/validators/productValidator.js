import slugify from "slugify";
import { check, body } from "express-validator";
import { validatorMiddleware } from "../../middlewares/validatorMiddleware.js";
import Category from "../../models/categoryModel.js";
import SubCategory from "../../models/subCategoryModel.js";

// Create Product Validator
export const createProductValidator = [
  body("images")
    .isArray({ min: 1 })
    .withMessage("At least one image is required"),
  body("images.*.url")
    .notEmpty()
    .withMessage("Image URL is required")
    .matches(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)
    .withMessage("Invalid image URL"),
  body("images.*.alt").optional().isString().trim(),
  body("images.*.id").optional().isString(),

  check("options")
    .isArray({ min: 1 })
    .withMessage("options must have at least one item"),
  body("options.*.name")
    .notEmpty()
    .withMessage("Option name is required")
    .isString()
    .withMessage("Option name must be a string"),
  body("options.*.values")
    .isArray({ min: 1 })
    .withMessage("Option values must be a non-empty array"),

  check("variants")
    .isArray({ min: 1 })
    .withMessage("At least one variant is required")
    .custom((variants, { req }) => {
      const optionsMap = Object.fromEntries(
        req.body.options.map((opt) => [opt.name, opt.values])
      );

      const allVariantsValid = variants.every((variant) =>
        Object.entries(variant.attributes).every(([key, value]) => {
          const allowedValues = optionsMap[key];
          return allowedValues && allowedValues.includes(value);
        })
      );

      if (!allVariantsValid) {
        throw new Error("Invalid attributes provided for one or more variants");
      }

      return true;
    }),

  body("variants.*.price")
    .isFloat({ min: 0 })
    .withMessage("Price must be >= 0"),
  body("variants.*.images")
    .isArray({ min: 1 })
    .withMessage("At least one image is required for each variant"),
  body("variants.*.images.*.url")
    .notEmpty()
    .withMessage("Image URL is required")
    .isString()
    .withMessage("Image URL must be a string"),
  body("variants.*.images.*.id").optional().isString(),
  body("variants.*.stock").isInt({ min: 0 }).withMessage("Stock must be >= 0"),
  body("variants.*.attributes").custom((attr) => {
    if (!attr || Object.keys(attr).length === 0)
      throw new Error("Attributes required");
    return true;
  }),

  check("title")
    .isLength({ min: 3 })
    .withMessage("must be at least 3 chars")
    .notEmpty()
    .withMessage("Product title is required")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("description")
    .notEmpty()
    .withMessage("Product description is required")
    .isLength({ max: 2000 })
    .withMessage("Too long description"),

  body("imageCover")
    .notEmpty()
    .withMessage("Product imageCover is required")
    .isObject()
    .withMessage("imageCover must be an object"),
  body("imageCover.url")
    .notEmpty()
    .withMessage("imageCover url is required")
    .isString()
    .withMessage("imageCover url must be a string")
    .isURL()
    .withMessage("imageCover url must be a valid URL"),
  body("imageCover.id").optional().isString(),

  check("category")
    .notEmpty()
    .withMessage("Product must belong to a category")
    .isMongoId()
    .withMessage("Invalid ID format")
    .custom((categoryId) =>
      Category.findById(categoryId).then((category) => {
        if (!category) {
          return Promise.reject(
            new Error(`No category exists for this id: ${categoryId}`)
          );
        }
      })
    ),

  check("subcategory")
    .optional()
    .toArray()
    .custom((subcategoriesIds) =>
      SubCategory.find({ _id: { $exists: true, $in: subcategoriesIds } }).then(
        (results) => {
          if (
            results.length < 1 ||
            subcategoriesIds.length !== results.length
          ) {
            return Promise.reject(new Error("Invalid subcategory IDs"));
          }
        }
      )
    )
    .custom((val, { req }) =>
      SubCategory.find({ category: req.body.category }).then(
        (subcategories) => {
          const subIdsInDB = subcategories.map((s) => s._id.toString());
          const checker = (arr, target) => target.every((t) => arr.includes(t));
          if (!checker(subIdsInDB, val)) {
            return Promise.reject(
              new Error("Subcategory does not belong to the selected category")
            );
          }
        }
      )
    ),

  check("brand").optional().isMongoId().withMessage("Invalid ID format"),

  check("ratingsAverage")
    .optional()
    .isNumeric()
    .withMessage("ratingsAverage must be a number")
    .isLength({ min: 1 })
    .withMessage("Rating must be above or equal 1.0")
    .isLength({ max: 5 })
    .withMessage("Rating must be below or equal 5.0"),

  check("ratingsQuantity")
    .optional()
    .isNumeric()
    .withMessage("ratingsQuantity must be a number"),

  validatorMiddleware,
];

// Get Product Validator
export const getProductValidator = [
  check("id").isMongoId().withMessage("Invalid ID format"),
  validatorMiddleware,
];

// Update Product Validator
export const updateProductValidator = [
  check("id").isMongoId().withMessage("Invalid ID format"),
  body("title")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

// Delete Product Validator
export const deleteProductValidator = [
  check("id").isMongoId().withMessage("Invalid ID format"),
  validatorMiddleware,
];
