import express from "express";
import {
  getUser,
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  updateUserPassword,
  updateLoggedUserPassword,
  updateLoggedUserData,
  getLoggedUserData,
  deleteLoggedUser,
} from "../controllers/userController.js";

import {
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  getUserValidator,
  changeUserPasswordValidator,
  changeLoggedUserPassValidator,
  updateLoggedUserValidator,
} from "../utils/validators/userValidator.js";

import * as authController from "../controllers/authController.js";
import { executeDeletedMiddleware } from "../middlewares/softDeleteMiddleware.js";

const router = express.Router();

// Logged-in user routes
router.put(
  "/changeMyPassword",
  authController.auth,
  changeLoggedUserPassValidator,
  updateLoggedUserPassword
);

router.put(
  "/updateMe",
  authController.auth,
  updateLoggedUserValidator,
  updateLoggedUserData
);

router.get(
  "/getMe",
  authController.auth,
  getLoggedUserData,
  executeDeletedMiddleware,
  getUser
);

router.delete("/deleteMe", authController.auth, deleteLoggedUser);

// Admin routes
router.put(
  "/change-password/:id",
  changeUserPasswordValidator,
  updateUserPassword
);

router
  .route("/")
  .get(authController.auth, authController.allowedTo("admin"), getUsers)
  .post(
    authController.auth,
    authController.allowedTo("admin"),
    createUserValidator,
    createUser
  );

router
  .route("/:id")
  .get(
    authController.auth,
    authController.allowedTo("admin"),
    getUserValidator,
    getUser
  )
  .put(
    authController.auth,
    authController.allowedTo("admin"),
    updateUserValidator,
    updateUser
  )
  .delete(
    authController.auth,
    authController.allowedTo("admin"),
    deleteUserValidator,
    deleteUser
  );

export default router;
