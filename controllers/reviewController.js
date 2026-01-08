import asyncHandler from "express-async-handler";
import * as factory from "./handlersFactory.js";
import Review from "../models/reviewModel.js";

// Middleware to create filterObject for get reviews in product
export const createFilterObj = (req, res, next) => {
  let filter = {};
  if (req.params.productId) filter = { product: req.params.productId };
  req.filterObject = filter;
  next();
};

// @desc      Get all reviews
// @route     GET /api/v1/reviews
// @access    Public
export const getReviews = factory.getAll(Review);

// @desc      Get specific review by id
// @route     GET /api/v1/reviews/:id
// @access    Public
export const getReview = factory.getOne(Review);

// Allow nested routes
export const setProductAndUserIds = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

// @desc      Create review
// @route     POST /api/v1/reviews
// @access    Private/Protect
export const createReview = factory.createOne(Review);

// @desc      Update review
// @route     PATCH /api/v1/reviews/:id
// @access    Private/Protect
export const updateReview = factory.updateOne(Review);

// @desc      Delete review
// @route     DELETE /api/v1/reviews/:id
// @access    Private/Protect
export const deleteReview = factory.deleteOne(Review);
