import express from "express";
import {
  getReview,
  getReviews,
  updateReview,
  createReview,
  deleteReview,
  setProductAndUserIds,
  createFilterObj,
} from "../controllers/reviewController.js";
import {
  createReviewValidator,
  getReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
} from "../utils/validators/reviewValidator.js";

import * as authController from "../controllers/authController.js";
import { executeDeletedMiddleware } from "../middlewares/softDeleteMiddleware.js";

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(createFilterObj, executeDeletedMiddleware, getReviews)
  .post(
    authController.auth,
    authController.allowedTo("user"),
    setProductAndUserIds,
    createReviewValidator,
    createReview
  );

router
  .route("/:id")
  .get(getReviewValidator, executeDeletedMiddleware, getReview)
  .put(
    authController.auth,
    authController.allowedTo("user"),
    updateReviewValidator,
    updateReview
  )
  .delete(
    authController.auth,
    authController.allowedTo("user", "manager", "admin"),
    deleteReviewValidator,
    deleteReview
  );
export default router;
