const express = require("express");
const {
  addProductToCart,
  updateCartProductCount,
  getLoggedUserCart,
  removeCartProduct,
  clearLoggedUserCart,
  applyCouponToCart,
} = require("../controllers/cartService");

const authController = require("../controllers/authController");
const {
  createItemValidator,
  removeItemValidator,
  updateItemValidator,
} = require("../utils/validators/cartValidator");

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

module.exports = router;
