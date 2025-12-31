import express from "express";
import {
  getBrands,
  createBrand,
  getBrand,
  updateBrand,
  deleteBrand,
  uploadBrandImage,
  resizeImage,
  deleteAll,
} from "../controllers/brandController.js";

import {
  createBrandValidator,
  getBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
} from "../utils/validators/brandValidator.js";

import * as authController from "../controllers/authController.js";
import { executeDeletedMiddleware } from "../middlewares/softDeleteMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(executeDeletedMiddleware, getBrands)
  .post(
    authController.auth,
    authController.allowedTo("admin", "manager"),
    // uploadBrandImage,
    // resizeImage,
    createBrandValidator,
    createBrand
  )
  .delete(deleteAll);

// router.use(idValidation);
router
  .route("/:id")
  .get(getBrandValidator, getBrand)
  .put(
    authController.auth,
    authController.allowedTo("admin", "manager"),
    uploadBrandImage,
    resizeImage,
    updateBrandValidator,
    updateBrand
  )
  .delete(
    authController.auth,
    authController.allowedTo("admin"),
    deleteBrandValidator,
    deleteBrand
  );

export default router;
