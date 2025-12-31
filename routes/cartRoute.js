import express from "express";
import {
  addProductToCart,
  updateCartProductCount,
  getLoggedUserCart,
  removeCartProduct,
  clearLoggedUserCart,
  applyCouponToCart,
} from "../controllers/cartService.js";

import * as authController from "../controllers/authController.js";
import {
  createItemValidator,
  removeItemValidator,
  updateItemValidator,
} from "../utils/validators/cartValidator.js";

const router = express.Router();

router.use(
  authController.auth,
  authController.allowedTo("user", "admin", "manager")
);

router.route("/applyCoupon").put(applyCouponToCart);

router
  .route("/")
  .post(createItemValidator, addProductToCart)
  .get(getLoggedUserCart)
  .delete(clearLoggedUserCart);

router
  .route("/:sku")
  .put(updateItemValidator, updateCartProductCount)
  .delete(removeItemValidator, removeCartProduct);

export default router;
