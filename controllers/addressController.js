import asyncHandler from "express-async-handler";

import User from "../models/userModel.js";

// @desc      Add address to user addresses
// @route     POST /api/v1/addresses
// @access    Private/User
export const addAddressToUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: req.body },
    },
    { new: true }
  );

  return res.status(200).json({
    status: "success",
    message: "Address added successfully",
    data: user.addresses,
  });
});

// @desc      Remove address from addresses list
// @route     DELETE /api/v1/addresses/:addressId
// @access    Private/User
export const removeAddress = asyncHandler(async (req, res, next) => {
  const { addressId } = req.params;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: {
        addresses: { _id: addressId },
      },
    },
    { new: true }
  );

  return res.status(200).json({
    status: "success",
    message: "Address removed successfully",
    data: user.addresses,
  });
});

// @desc      Update address from addresses list
// @route     PUT /api/v1/addresses/:addressId
// @access    Private/User
export const updateAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const address = user.addresses.id(req.params.addressId);

  address.alias = req.body.alias || address.alias;
  address.details = req.body.details || address.details;
  address.phone = req.body.phone || address.phone;
  address.city = req.body.city || address.city;
  address.postalCode = req.body.postalCode || address.postalCode;

  await user.save();

  return res.status(200).json({
    status: "success",
    message: "Address updated successfully",
    data: address,
  });
});

// @desc      Get specific address from addresses list
// @route     GET /api/v1/addresses/:addressId
// @access    Private/User
export const getAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const address = user.addresses.id(req.params.addressId);

  return res.status(200).json({
    status: "success",
    data: address,
  });
});

// @desc      Get logged user addresses
// @route     GET /api/v1/addresses
// @access    Private/User
export const myAddresses = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .select("addresses")
    .populate("addresses");

  res.status(200).json({
    results: user.addresses.length,
    status: "success",
    data: user.addresses,
  });
});
