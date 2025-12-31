const slugify = require("slugify");
const { check, body } = require("express-validator");

const {
  validatorMiddleware,
} = require("../../middlewares/validatorMiddleware");
const Category = require("../../models/categoryModel");
const SubCategory = require("../../models/subCategoryModel");

exports.createProductValidator = [
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
    .withMessage("options must be at least one"),
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
    .withMessage("At least one variant required")
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

  body("variants.*.images.*.id")
    .optional()
    .isString()
    .withMessage("Image id must be a string if provided"),
  body("variants.*.stock").isInt({ min: 0 }).withMessage("Stock must be >= 0"),
  body("variants.*.attributes").custom((attr, { req }) => {
    if (!attr || Object.keys(attr).length === 0)
      throw new Error("Attributes required");
    return true;
  }),

  check("title")
    .isLength({ min: 3 })
    .withMessage("must be at least 3 chars")
    .notEmpty()
    .withMessage("Product required")
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

  // imageCover.url
  body("imageCover.url")
    .notEmpty()
    .withMessage("imageCover url is required")
    .isString()
    .withMessage("imageCover url must be a string")
    .isURL()
    .withMessage("imageCover url must be a valid URL"),

  // imageCover.id (Cloudinary public_id)
  body("imageCover.id")
    .optional()
    .isString()
    .withMessage("imageCover id must be a string"),

  // 1- check if category exist in our db
  check("category")
    .notEmpty()
    .withMessage("Product must be belong to a category")
    .isMongoId()
    .withMessage("Invalid ID formate")
    .custom((categoryId) =>
      Category.findById(categoryId).then((category) => {
        if (!category) {
          return Promise.reject(
            new Error(`No category exist for this id: ${categoryId}`)
          );
        }
      })
    ),
  // 2- Check if subcategories exist in our db
  // 3- check if subcategories belong to category
  check("subcategory")
    .optional()
    .toArray()
    .custom((subcategoriesIds) =>
      SubCategory.find({
        _id: { $exists: true, $in: subcategoriesIds },
      }).then((results) => {
        if (results.length < 1 || subcategoriesIds.length !== results.length) {
          return Promise.reject(new Error("Invalid subcategories Ids"));
        }
      })
    )
    .custom((val, { req }) =>
      SubCategory.find({
        category: req.body.category,
      }).then((subcategories) => {
        // check if subcategories in body the same subcategories in category
        const subIdsInDB = [];
        subcategories.forEach((subcategory) => {
          subIdsInDB.push(subcategory._id.toString());
        });
        const checker = (arr, target) => target.every((t) => arr.includes(t));
        // console.log(checker(subIdsInDB, val));
        if (!checker(subIdsInDB, val)) {
          return Promise.reject(
            new Error("Subcategory not belong to category")
          );
        }
      })
    ),

  check("brand").optional().isMongoId().withMessage("Invalid ID formate"),

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

exports.getProductValidator = [
  check("id").isMongoId().withMessage("Invalid ID formate"),
  validatorMiddleware,
];

exports.updateProductValidator = [
  check("id").isMongoId().withMessage("Invalid ID formate"),
  body("title")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

exports.deleteProductValidator = [
  check("id").isMongoId().withMessage("Invalid ID formate"),
  validatorMiddleware,
];
