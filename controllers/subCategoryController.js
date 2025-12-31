import * as factory from "./handlersFactory.js";
import SubCategory from "../models/subCategoryModel.js";

// Middleware to set categoryId in body before creating subcategory
export const setCategoryIdBody = (req, res, next) => {
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

// Middleware to create filterObject for get subcategories in category
export const createFilterObj = (req, res, next) => {
  let filter = {};
  if (req.params.categoryId) filter = { category: req.params.categoryId };
  req.filterObject = filter;
  next();
};

// @desc      Get all subcategories
// @route     GET /api/v1/categories
// @access    Public
export const getSubCategories = factory.getAll(SubCategory);

// @desc      Get specific subcategory by id
// @route     GET /api/v1/categories/:id
// @access    Public
export const getSubCategory = factory.getOne(SubCategory);

// @desc      Create subcategory
// @route     POST /api/v1/subcategories
// @access    Private
export const createSubCategory = factory.createOne(SubCategory);

// @desc      Update subcategory
// @route     PATCH /api/v1/categories/:id
// @access    Private
export const updateSubCategory = factory.updateOne(SubCategory);

// @desc      Delete subcategory
// @route     DELETE /api/v1/categories/:id
// @access    Private
export const deleteSubCategory = factory.softDeleteOne(SubCategory);
