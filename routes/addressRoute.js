import express from "express";
import {
  addAddressToUser,
  removeAddress,
  myAddresses,
  updateAddress,
  getAddress,
} from "../controllers/addressController.js";

import * as authController from "../controllers/authController.js";

const router = express.Router();

router
  .route("/")
  .post(authController.auth, addAddressToUser)
  .get(authController.auth, myAddresses);

router
  .route("/:addressId")
  .get(authController.auth, getAddress)
  .delete(authController.auth, removeAddress)
  .put(authController.auth, updateAddress);

export default router;
