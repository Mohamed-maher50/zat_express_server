import { body, param } from "express-validator";
import { validatorMiddleware } from "../../middlewares/validatorMiddleware.js";

const quantityValidator = body("quantity")
  .isInt({ min: 1 })
  .withMessage("Quantity must be a positive integer");

const SKU_REGEX = /^PROD-[A-Z0-9]{10}$/;

const skuParamValidator = param("sku")
  .trim()
  .matches(SKU_REGEX)
  .withMessage(
    "Invalid SKU format. Expected format: PROD-XXXXXXXXXX (uppercase letters and numbers)"
  )
  .notEmpty()
  .withMessage("SKU is required");

export const createItemValidator = [
  body("productId").isMongoId().withMessage("Invalid productId"),
  body("variantSku")
    .trim()
    .notEmpty()
    .matches(SKU_REGEX)
    .withMessage(
      "Invalid SKU format. Expected format: PROD-XXXXXXXXXX (uppercase letters and numbers)"
    ),
  quantityValidator,
  validatorMiddleware,
];

export const updateItemValidator = [
  skuParamValidator,
  body("quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
  validatorMiddleware,
];

export const removeItemValidator = [skuParamValidator, validatorMiddleware];
