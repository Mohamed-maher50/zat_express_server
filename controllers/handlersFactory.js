import asyncHandler from "express-async-handler";
import ApiError from "../utils/apiError.js";
import ApiFeatures from "../utils/apiFeatures.js";

// Helper function to set image URLs for documents
const setImageUrl = (doc) => {
  if (doc.imageCover) {
    doc.imageCover = `${doc.imageCover}`;
  }
  if (doc.images) {
    doc.images = doc.images.map((image) => `${image}`);
  }
};

// Helper function to check if document is a Product
const isProduct = (doc) => doc.constructor.modelName === "Product";

// Helper function to check if model is products collection
const isProductsCollection = (Model) =>
  Model.collection.collectionName === "products";

// @desc    Soft delete a document (sets isDeleted: true)
export const softDeleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
    });

    if (!document) {
      return next(
        new ApiError(`No document found for this id: ${req.params.id}`, 404)
      );
    }

    res.status(204).send();
  });

// @desc    Permanently delete a document
export const deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document) {
      return next(
        new ApiError(`No document found for this id: ${req.params.id}`, 404)
      );
    }

    // Trigger 'remove' event when delete document
    document.remove();
    res.status(204).send();
  });

// @desc    Update a single document
export const updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!document) {
      return next(
        new ApiError(`No document found for this id: ${req.params.id}`, 404)
      );
    }

    // Trigger 'save' event when update document
    const doc = await document.save();

    if (isProduct(doc)) {
      setImageUrl(doc);
    }

    res.status(200).json({ data: doc });
  });

// @desc    Create a new document
export const createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const newDoc = await Model.create(req.body);

    if (isProduct(newDoc)) {
      setImageUrl(newDoc);
    }

    res.status(201).json({ data: newDoc });
  });

// @desc    Get a single document by ID
export const getOne = (Model, populateOpts) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // Build query
    let query = Model.findById(id);
    if (populateOpts) query = query.populate(populateOpts);

    // Execute query
    const document = await query;

    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }

    if (isProduct(document)) {
      setImageUrl(document);
    }

    res.status(200).json({ data: document });
  });

// @desc    Get all documents with filtering, searching, sorting, and pagination
export const getAll = (Model, modelName = "") =>
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.filterObject) {
      filter = req.filterObject;
    }

    // Build query with ApiFeatures
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .search(modelName)
      .limitFields()
      .sort();

    // Apply pagination after filter and search
    const docsCount = await Model.countDocuments(apiFeatures.mongooseQuery);
    apiFeatures.paginate(docsCount);

    // Execute query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;

    // Set image URLs for products
    if (isProductsCollection(Model)) {
      documents.forEach((doc) => setImageUrl(doc));
    }

    res.status(200).json({
      results: docsCount,
      paginationResult,
      data: documents,
    });
  });

// @desc    Delete all documents (use with caution)
export const deleteAll = (Model) =>
  asyncHandler(async (req, res, next) => {
    await Model.deleteMany();
    res.status(204).send();
  });
