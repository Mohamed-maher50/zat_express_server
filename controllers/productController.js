import { v4 as uuidv4 } from "uuid";
import asyncHandler from "express-async-handler";
import multer from "multer";

import ApiError from "../utils/apiError.js";
import Product from "../models/productModel.js";
import * as factory from "./handlersFactory.js";

// Storage configuration
const multerStorage = multer.memoryStorage();

// Filter to accept only images
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new ApiError("only images allowed", 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// @desc    Upload product images (imageCover and images)
export const uploadProductImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 5 },
]);

// @desc    Resize and process product images
export const resizeProductImages = asyncHandler(async (req, res, next) => {
  // Process imageCover
  if (req.files.imageCover) {
    const ext = req.files.imageCover[0].mimetype.split("/")[1];
    const imageCoverFilename = `products-${uuidv4()}-${Date.now()}-cover.${ext}`;

    // await sharp(req.files.imageCover[0].buffer)
    //   .resize(2000, 1333)
    //   .toFormat('jpeg')
    //   .jpeg({ quality: 90 })
    //   .toFile(`uploads/products/${imageCoverFilename}`);

    req.body.imageCover = imageCoverFilename;
  }

  req.body.images = [];

  // Process images array
  if (req.files.images) {
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const ext = img.mimetype.split("/")[1];
        const filename = `products-${uuidv4()}-${Date.now()}-${
          index + 1
        }.${ext}`;

        // await sharp(img.buffer)
        //   .resize(800, 800)
        //   .toFormat('jpeg')
        //   .jpeg({ quality: 90 })
        //   .toFile(`uploads/products/${filename}`);

        req.body.images.push(filename);
      })
    );
  }

  next();
});

// @desc      Get all products
// @route     GET /api/v1/products
// @access    Public
export const getProducts = factory.getAll(Product, "Products");

// @desc      Get specific product by id
// @route     GET /api/v1/products/:id
// @access    Public
export const getProduct = factory.getOne(Product, "reviews brand");

// @desc      Create product
// @route     POST /api/v1/products
// @access    Private
export const createProduct = factory.createOne(Product);

// @desc      Update product
// @route     PATCH /api/v1/products/:id
// @access    Private
export const updateProduct = factory.updateOne(Product);

// @desc      Delete product
// @route     DELETE /api/v1/products/:id
// @access    Private
export const deleteProduct = factory.softDeleteOne(Product);
