import express from "express";
import {
  signup,
  login,
  forgotPassword,
  verifyPasswordResetCode,
  resetPassword,
  google,
} from "../controllers/authController.js";

import {
  signupValidator,
  loginValidator,
} from "../utils/validators/authValidator.js";

const router = express.Router();
router.post("/google", google);
router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);

router.post("/forgotPasswords", forgotPassword);
router.post("/verifyResetCode", verifyPasswordResetCode);
router.put("/resetPassword", resetPassword);

export default router;
