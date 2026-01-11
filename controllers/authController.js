import crypto from "crypto";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import ApiError from "../utils/apiError.js";
import sendEmail from "../utils/sendEmail.js";
import User from "../models/userModel.js";
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// @desc      Signup
// @route     POST /api/v1/auth/signup
// @access    Public
export const google = asyncHandler(async (req, res, next) => {
  const { id_token } = req.body;
  if (!id_token) {
    throw new ApiError("ID token is required", 400);
  }
  const ticket = await client.verifyIdToken({
    idToken: id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload) throw new ApiError("Invalid token payload", 404);

  let user = await User.findOne({ email: payload.email });
  if (!user) {
    user = await User.create({
      email: payload.email,
      role: "user",
      name: payload.name,
      image: payload.picture,
    });
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(201).json({ data: user, token });
});
// @desc      Signup
// @route     POST /api/v1/auth/signup
// @access    Public
export const signup = asyncHandler(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    slug: req.body.slug,
    email: req.body.email,
    phone: req.body.phone,
    profileImg: req.body.profileImg,
    password: req.body.password,
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(201).json({ data: user, token });
});

// @desc      Login
// @route     POST /api/v1/auth/login
// @access    Public
export const login = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email }).select(
    "+password"
  );
  let isCorrectPassword = false;
  if (user) {
    isCorrectPassword = await bcrypt.compare(req.body.password, user.password);
  }

  if (!user || !isCorrectPassword) {
    return next(new ApiError("Incorrect email or password", 401));
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  delete user._doc.password;

  res.status(200).json({ data: user, token });
});

// @desc      Authenticate user (check if logged in)
// @route     Used as middleware for protected routes
// @access    Private
export const auth = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new ApiError("You are not logged in. Please login to get access", 401)
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id).select(
    "+passwordChangedAt"
  );
  if (!currentUser) {
    return next(
      new ApiError(
        "The user that belong to this token does no longer exist",
        401
      )
    );
  }

  // Check if user changed password after token was issued
  if (currentUser.passwordChangedAt) {
    const passChangedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    if (passChangedTimestamp > decoded.iat) {
      return next(
        new ApiError(
          "User recently changed password! Please login again..",
          401
        )
      );
    }
  }

  req.user = currentUser;
  next();
});

// @desc      Authorization - check if user has required role
// @route     Used as middleware for role-based routes
// @access    Private
export const allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not allowed to perform this action", 403)
      );
    }
    next();
  });

// @desc      Forgot password
// @route     POST /api/v1/auth/forgotPassword
// @access    Public
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(
      new ApiError(`There is no user with this email address ${email}`, 404)
    );
  }

  // Generate 6-digit random reset code
  const resetCode = Math.floor(Math.random() * 1000000 + 1).toString();

  // Hash reset code before saving to database (Security)
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  // Save hashed reset code and expiration time to database
  user.passwordResetCode = hashedResetCode;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  user.resetCodeVerified = false;
  await user.save();

  // Send reset code via email
  const message = `Forgot your password? Submit this reset password code : ${resetCode}\n If you didn't forgot your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your Password Reset Code (valid for 10 min)",
      message,
    });

    res.status(200).json({
      status: "Success",
      message: "Reset code sent to your email",
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new ApiError(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }
});

// @desc      Verify password reset code
// @route     POST /api/v1/auth/verifyResetCode
// @access    Public
export const verifyPasswordResetCode = asyncHandler(async (req, res, next) => {
  // Hash the provided reset code to match with database
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  // Find user with valid reset code that hasn't expired
  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError("Reset code is invalid or has expired", 400));
  }

  user.resetCodeVerified = true;
  await user.save();

  res.status(200).json({
    status: "Success",
  });
});

// @desc      Reset password
// @route     POST /api/v1/auth/resetPassword
// @access    Public
export const resetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email }).select(
    "+password +passwordResetCode +passwordResetExpires +resetCodeVerified"
  );
  if (!user) {
    return next(
      new ApiError(
        `There is no user with this email address ${req.body.email}`,
        404
      )
    );
  }

  if (!user.resetCodeVerified) {
    return next(new ApiError("reset code not verified", 400));
  }

  // Update password and clear reset code fields
  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.resetCodeVerified = undefined;

  await user.save();

  // Generate new token after password reset
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(200).json({ token });
});
