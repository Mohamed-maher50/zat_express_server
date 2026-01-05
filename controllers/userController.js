import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import ApiError from "../utils/apiError.js";
import * as factory from "./handlersFactory.js";
import User from "../models/userModel.js";

// @desc      Get all users
// @route     GET /api/v1/users
// @access    Private/Admin
export const getUsers = factory.getAll(User, "Users");

// @desc      Get specific user by id
// @route     GET /api/v1/users/:id
// @access    Private/Admin
export const getUser = factory.getOne(User);

// @desc      Create user
// @route     POST /api/v1/users
// @access    Private/Admin
export const createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    slug: req.body.slug,
    email: req.body.email,
    phone: req.body.phone,
    profileImg: req.body.profileImg,
    password: req.body.password,
  });

  res.status(201).json({ data: user });
});

// @desc      Update user data without password
// @route     PATCH /api/v1/users/:id
// @access    Private/Admin
export const updateUser = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      slug: req.body.slug,
      email: req.body.email,
      phone: req.body.phone,
      role: req.body.role,
      isDeleted: req.body.isDeleted,
    },
    { new: true }
  );

  if (!document) {
    return next(
      new ApiError(`No document found for this id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ data: document });
});

// @desc      Update user password
// @route     PATCH /api/v1/users/:id/password
// @access    Private/Admin
export const updateUserPassword = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    { new: true }
  );

  if (!document) {
    return next(
      new ApiError(`No document found for this id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ data: document });
});

// @desc     Delete user
// @route    DELETE /api/v1/users/:id
// @access   Private/Admin
export const deleteUser = factory.deleteOne(User);

// @desc    Update logged-in user password
// @route   PUT /api/v1/users/changeMyPassword
// @access  Private/Protect
export const updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    { new: true }
  );

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(200).json({ data: user, token });
  next();
});

// Utility to filter allowed fields
const filterObject = (obj, ...allowedFields) => {
  const newBodyObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) newBodyObj[key] = obj[key];
  });
  return newBodyObj;
};

// @desc    Update logged-in user data
// @route   PUT /api/v1/users/updateMe
// @access  Private/Protect
export const updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const allowedBodyFields = filterObject(
    req.body,
    "name",
    "email",
    "phone",
    "image"
  );

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    allowedBodyFields,
    {
      new: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: { user: updatedUser },
  });
});

// @desc    Get logged-in user data
// @route   GET /api/v1/users/getMe
// @access  Private/Protect
export const getLoggedUserData = asyncHandler((req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @desc    Delete logged-in user
// @route   DELETE /api/v1/users/deleteMe
// @access  Private/Protect
export const deleteLoggedUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { isDeleted: false });
  res.status(204).json({ status: "success" });
});
