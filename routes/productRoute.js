import express from "express";
import {
  getProduct,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import {
  createProductValidator,
  getProductValidator,
  updateProductValidator,
  deleteProductValidator,
} from "../utils/validators/productValidator.js";

import * as authController from "../controllers/authController.js";
import reviewRoute from "./reviewRoute.js";
import { executeDeletedMiddleware } from "../middlewares/softDeleteMiddleware.js";

const router = express.Router();

// POST  /products/n1b1213ga2/reviews
// GET   /products/n1b1213ga2/reviews
// GET   /products/n1b1213ga2/reviews/jjh132hh4
router.use("/:productId/reviews", reviewRoute);

router
  .route("/")
  .get(executeDeletedMiddleware, getProducts)
  .post(
    authController.auth,
    authController.allowedTo("admin", "manager"),
    createProductValidator,
    createProduct
  );

// router.use(idValidation);
router
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(
    authController.auth,
    authController.allowedTo("admin", "manager"),
    updateProductValidator,
    updateProduct
  )
  .delete(
    authController.auth,
    authController.allowedTo("admin"),
    deleteProductValidator,
    deleteProduct
  );
export default router;
