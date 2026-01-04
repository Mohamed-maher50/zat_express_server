import express from "express";
import {
  getCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  resizeImage,
  deleteAll,
} from "../controllers/categoryController.js";

import {
  createCategoryValidator,
  getCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} from "../utils/validators/categoryValidator.js";

import * as authController from "../controllers/authController.js";
import subCategoryRoute from "./subCategoryRoute.js";

const router = express.Router();
router.use("/:categoryId/subcategories", subCategoryRoute);

router
  .route("/")
  .get(getCategories)
  .post(
    authController.auth,
    authController.allowedTo("admin", "manager"),
    // uploadCategoryImage,
    // resizeImage,
    createCategoryValidator,
    createCategory
  )
  .delete(deleteAll);

router
  .route("/:id")
  .get(getCategoryValidator, getCategory)
  .put(
    authController.auth,
    authController.allowedTo("admin", "manager"),
    uploadCategoryImage,
    resizeImage,
    updateCategoryValidator,
    updateCategory
  )
  .delete(
    authController.auth,
    authController.allowedTo("admin"),
    deleteCategoryValidator,
    deleteCategory
  );

export default router;
