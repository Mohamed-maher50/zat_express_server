import slugify from "slugify";
import bcrypt from "bcryptjs";
import { check, body } from "express-validator";
import { validatorMiddleware } from "../../middlewares/validatorMiddleware.js";
import User from "../../models/userModel.js";

// Create User Validator
export const createUserValidator = [
  check("name")
    .isLength({ min: 3 })
    .withMessage("must be at least 3 chars")
    .notEmpty()
    .withMessage("name required field")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("Email required field")
    .isEmail()
    .withMessage("Invalid email format")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error(`E-mail already in use`));
        }
      })
    ),
  check("password")
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 6 })
    .withMessage("must be at least 6 chars")
    .custom(async (val, { req }) => {
      req.body.password = await bcrypt.hash(val, 12);
      if (val !== req.body.passwordConfirm) {
        throw new Error(`Password confirmation is incorrect`);
      }
      return true;
    }),
  check("passwordConfirm")
    .notEmpty()
    .withMessage("passwordConfirm is required field"),
  check("phone")
    .optional()
    .isMobilePhone("ar-EG")
    .withMessage("accept only egypt phone numbers"),
  validatorMiddleware,
];

// Get User Validator
export const getUserValidator = [
  check("id").isMongoId().withMessage("Invalid ID format"),
  validatorMiddleware,
];

// Update User Validator
export const updateUserValidator = [
  check("id").isMongoId().withMessage("Invalid ID format"),
  body("name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  body("password")
    .optional()
    .custom(async (val, { req }) => {
      req.body.password = await bcrypt.hash(val, 12);
      return true;
    }),
  body("isDeleted").optional().isBoolean().default(false),
  validatorMiddleware,
];

// Delete User Validator
export const deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid ID format"),
  validatorMiddleware,
];

// Change User Password Validator
export const changeUserPasswordValidator = [
  check("id").isMongoId().withMessage("Invalid ID format"),
  check("currentPassword").notEmpty().withMessage("currentPassword required"),
  check("passwordConfirm").notEmpty().withMessage("passwordConfirm required"),
  check("password")
    .notEmpty()
    .withMessage("Password Required")
    .custom(async (val, { req }) => {
      const user = await User.findById(req.params.id);
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isCorrectPassword) throw new Error(`Incorrect current password`);
      if (val !== req.body.passwordConfirm)
        throw new Error(`Password confirmation is incorrect`);
      return true;
    }),
  validatorMiddleware,
];

// Change Logged User Password Validator
export const changeLoggedUserPassValidator = [
  check("currentPassword").notEmpty().withMessage("currentPassword required"),
  check("passwordConfirm").notEmpty().withMessage("passwordConfirm required"),
  check("password")
    .notEmpty()
    .withMessage("Password Required")
    .custom(async (val, { req }) => {
      const user = await User.findById(req.user._id);
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isCorrectPassword) throw new Error(`Incorrect current password`);
      if (val !== req.body.passwordConfirm)
        throw new Error(`Password confirmation is incorrect`);
      return true;
    }),
  validatorMiddleware,
];

// Update Logged User Validator
export const updateLoggedUserValidator = [
  body("name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) return Promise.reject(new Error(`E-mail already in use`));
      })
    ),
  check("phone")
    .optional()
    .isMobilePhone("ar-EG")
    .withMessage("accept only egypt phone numbers"),
  check("image")
    .isURL({
      host_whitelist: ["res.cloudinary.com"],
      protocols: ["https"],
    })
    .withMessage("Must be a valid URL")
    .optional(),
  validatorMiddleware,
];
