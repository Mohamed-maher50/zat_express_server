import express from "express";
import {
  addProductToWishlist,
  removeProductFromWishlist,
  myWishlist,
} from "../controllers/wishlistController.js";

import * as authController from "../controllers/authController.js";

const router = express.Router();

router
  .route("/")
  .post(authController.auth, addProductToWishlist)
  .get(authController.auth, myWishlist);

router.delete("/:productId", authController.auth, removeProductFromWishlist);
export default router;
