import slugify from "slugify";
import { check, body } from "express-validator";
import { validatorMiddleware } from "../../middlewares/validatorMiddleware.js";

// Create Category Validator
export const createCategoryValidator = [
  check("name")
    .isLength({ min: 3 })
    .withMessage("must be at least 3 chars")
    .notEmpty()
    .withMessage("Category required")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

// Get Category Validator
export const getCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid ID format"),
  validatorMiddleware,
];

// Update Category Validator
export const updateCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid ID format"),
  body("name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

// Delete Category Validator
export const deleteCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid ID format"),
  validatorMiddleware,
];
