import slugify from "slugify";
import { check, body } from "express-validator";
import { validatorMiddleware } from "../../middlewares/validatorMiddleware.js";

// Create SubCategory Validator
export const createSubCategoryValidator = [
  check("name")
    .isLength({ min: 2 })
    .withMessage("must be at least 2 chars")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("category")
    .isMongoId()
    .withMessage("Invalid ID format")
    .notEmpty()
    .withMessage("SubCategory must belong to a category"),
  validatorMiddleware,
];

// Get SubCategory Validator
export const getSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid ID format"),
  validatorMiddleware,
];

// Update SubCategory Validator
export const updateSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid ID format"),
  body("name").custom((val, { req }) => {
    req.body.slug = slugify(val);
    return true;
  }),
  validatorMiddleware,
];

// Delete SubCategory Validator
export const deleteSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid ID format"),
  validatorMiddleware,
];
