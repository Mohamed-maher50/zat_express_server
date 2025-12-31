import slugify from "slugify";
import { check, body } from "express-validator";
import { validatorMiddleware } from "../../middlewares/validatorMiddleware.js";

// check() => check body and params etc
export const createBrandValidator = [
  check("name")
    .isLength({ min: 3 })
    .withMessage("must be at least 3 chars")
    .notEmpty()
    .withMessage("Brand required")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("image")
    .isURL({
      host_whitelist: ["res.cloudinary.com"],
      protocols: ["https"],
    })
    .withMessage("Must be a valid URL"),
  validatorMiddleware,
];

export const getBrandValidator = [
  check("id").isMongoId().withMessage("Invalid ID format"),
  validatorMiddleware,
];

export const updateBrandValidator = [
  check("id").isMongoId().withMessage("Invalid ID format"),
  body("name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

export const deleteBrandValidator = [
  check("id").isMongoId().withMessage("Invalid ID format"),
  validatorMiddleware,
];
