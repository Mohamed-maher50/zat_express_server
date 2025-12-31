// brandController.js
import { v4 as uuidv4 } from "uuid";
import asyncHandler from "express-async-handler";

import * as factory from "./handlersFactory.js";
import { uploadSingleImage } from "../middlewares/imageUpload.js";
import Brand from "../models/brandModel.js";

export const uploadBrandImage = uploadSingleImage("image");

// Resize image
export const resizeImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  // req.file.filename = `category-${uuidv4()}-${Date.now()}.jpeg`;
  const ext = req.file.mimetype.split("/")[1];
  const filename = `brand-${uuidv4()}-${Date.now()}.${ext}`;

  // await sharp(req.file.buffer)
  //   // .resize(500, 500)
  //   // .toFormat('jpeg')
  //   // .jpeg({ quality: 90 })
  //   .toFile(`uploads/brands/${filename}`); // write into a file on the disk

  req.body.image = filename;
  next();
});

// @desc      Get all brands
// @route     GET /api/v1/brands
// @access    Public
export const getBrands = factory.getAll(Brand);

// @desc      Get specific brand by id
// @route     GET /api/v1/brands/:id
// @access    Public
export const getBrand = factory.getOne(Brand);

// @desc      Create brand
// @route     POST /api/v1/brands
// @access    Private
export const createBrand = factory.createOne(Brand);

// @desc      Update brand
// @route     PATCH /api/v1/brands/:id
// @access    Private
export const updateBrand = factory.updateOne(Brand);

// @desc     Delete brand
// @route    DELETE /api/v1/brands/:id
// @access   Private
export const deleteBrand = factory.softDeleteOne(Brand);

export const deleteAll = factory.deleteAll(Brand);
