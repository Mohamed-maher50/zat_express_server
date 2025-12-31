import express from "express";
import {
  getSubCategories,
  createSubCategory,
  getSubCategory,
  updateSubCategory,
  deleteSubCategory,
  setCategoryIdBody,
  createFilterObj,
} from "../controllers/subCategoryController.js";
import {
  createSubCategoryValidator,
  getSubCategoryValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator,
} from "../utils/validators/subCategoryValidator.js";

import * as authController from "../controllers/authController.js";
import { executeDeletedMiddleware } from "../middlewares/softDeleteMiddleware.js";

// mergeParams: allow us to access parameters on other routers
// ex: we access categoryId from category router
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(createFilterObj, executeDeletedMiddleware, getSubCategories)
  .post(
    authController.auth,
    authController.allowedTo("admin", "manager"),
    setCategoryIdBody,
    createSubCategoryValidator,
    createSubCategory
  );
router
  .route("/:id")
  .get(getSubCategoryValidator, getSubCategory)
  .put(
    authController.auth,
    authController.allowedTo("admin", "manager"),
    updateSubCategoryValidator,
    updateSubCategory
  )
  .delete(
    authController.auth,
    authController.allowedTo("admin"),
    deleteSubCategoryValidator,
    deleteSubCategory
  );
export default router;
