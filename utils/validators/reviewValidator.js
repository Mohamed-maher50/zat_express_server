import { check } from "express-validator";
import { validatorMiddleware } from "../../middlewares/validatorMiddleware.js";
import Review from "../../models/reviewModel.js";

// Create Review Validator
export const createReviewValidator = [
  check("review")
    .notEmpty()
    .withMessage("Review required")
    .custom((val, { req }) =>
      Review.findOne({ user: req.body.user, product: req.body.product }).then(
        (review) => {
          if (review) {
            return Promise.reject(
              new Error(`You already added review on this product`)
            );
          }
        }
      )
    ),
  check("rating")
    .notEmpty()
    .withMessage("Rating required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating min value 1.0 and max 5.0"),
  check("user").isMongoId().withMessage("Invalid User ID format"),
  check("product").isMongoId().withMessage("Invalid Product ID format"),
  validatorMiddleware,
];

// Get Review Validator
export const getReviewValidator = [
  check("id").isMongoId().withMessage("Invalid ID format"),
  validatorMiddleware,
];

// Update Review Validator
export const updateReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid ID format")
    .custom((val, { req }) =>
      Review.findOne({ _id: val }).then((review) => {
        if (!review) {
          return Promise.reject(
            new Error(`There is no review for this id ${val}`)
          );
        }
        if (review.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error(`You are not allowed to perform this action`)
          );
        }
      })
    ),
  validatorMiddleware,
];

// Delete Review Validator
export const deleteReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid ID format")
    .custom((val, { req }) => {
      if (req.user.role === "user") {
        return Review.findOne({ _id: val, user: req.user._id }).then(
          (review) => {
            if (!review) {
              return Promise.reject(
                new Error(`You are not allowed to perform this action`)
              );
            }
          }
        );
      }
      return true;
    }),
  validatorMiddleware,
];
