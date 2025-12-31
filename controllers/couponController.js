import * as factory from "./handlersFactory.js";
import Coupon from "../models/couponModel.js";

// @desc      Get all coupons
// @route     GET /api/v1/coupons
// @access    Private/Admin/Manager
export const getCoupons = factory.getAll(Coupon);

// @desc      Get specific coupon by id
// @route     GET /api/v1/coupons/:id
// @access    Private/Admin/Manager
export const getCoupon = factory.getOne(Coupon);

// @desc      Create coupon
// @route     POST /api/v1/coupons
// @access    Private/Admin/Manager
export const createCoupon = factory.createOne(Coupon);

// @desc      Update coupon
// @route     PATCH /api/v1/coupons/:id
// @access    Private/Admin/Manager
export const updateCoupon = factory.updateOne(Coupon);

// @desc     Delete coupon
// @route    DELETE /api/v1/coupons/:id
// @access   Private/Admin/Manager
export const deleteCoupon = factory.deleteOne(Coupon);
