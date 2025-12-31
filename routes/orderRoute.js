import express from "express";
import {
  createCashOrder,
  getSpecificOrder,
  filterOrdersForLoggedUser,
  getAllOrders,
  updateOrderToPaid,
  updateOrderToDelivered,
  checkoutSession,
} from "../controllers/orderService.js";

import * as authController from "../controllers/authController.js";

const router = express.Router();
router.use(authController.auth);

router.get("/checkout-session/:cartId", checkoutSession);

router
  .route("/:cartId")
  .post(authController.allowedTo("user", "admin"), createCashOrder);

router
  .route("/")
  .get(
    authController.allowedTo("user", "admin", "manager"),
    filterOrdersForLoggedUser,
    getAllOrders
  );

router
  .route("/:id")
  .get(authController.allowedTo("user", "admin", "manager"), getSpecificOrder);

router.patch("/:id/pay", updateOrderToPaid);
router.patch("/:id/deliver", updateOrderToDelivered);
export default router;
