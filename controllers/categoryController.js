import { v4 as uuidv4 } from "uuid";
import asyncHandler from "express-async-handler";

import * as factory from "./handlersFactory.js";
import { uploadSingleImage } from "../middlewares/imageUpload.js";
import Category from "../models/categoryModel.js";

// @desc    Upload single category image
export const uploadCategoryImage = uploadSingleImage("image");

// @desc    Resize and process category image
export const resizeImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  const ext = req.file.mimetype.split("/")[1];
  const filename = `category-${uuidv4()}-${Date.now()}.${ext}`;

  // await sharp(req.file.buffer)
  //   .resize(500, 500)
  //   .toFile(`uploads/categories/${filename}`);

  req.body.image = filename;
  next();
});

// @desc      Get all categories
// @route     GET /api/v1/categories
// @access    Public
export const getCategories = factory.getAll(Category);

// @desc      Get specific category by id
// @route     GET /api/v1/categories/:id
// @access    Public
export const getCategory = factory.getOne(Category);

// @desc      Create category
// @route     POST /api/v1/categories
// @access    Private
export const createCategory = factory.createOne(Category);

// @desc      Update category
// @route     PATCH /api/v1/categories/:id
// @access    Private
export const updateCategory = factory.updateOne(Category);

// @desc      Delete category
// @route     DELETE /api/v1/categories/:id
// @access    Private
export const deleteCategory = factory.deleteOne(Category);

// @desc      Delete all categories (use with caution)
export const deleteAll = factory.deleteAll(Category);
