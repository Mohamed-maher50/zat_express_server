import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

// @desc      Add product to wishlist
// @route     POST /api/v1/wishlist
// @access    Private/User
export const addProductToWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;
  // $addToSet => add productId to wishlist array if productId does not exist
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { wishlist: productId } },
    { new: true }
  );

  return res.status(200).json({
    status: "success",
    message: "Product added successfully to your wishlist",
    data: user.wishlist,
  });
});

// @desc      Remove product from wishlist
// @route     DELETE /api/v1/wishlist/:productId
// @access    Private/User
export const removeProductFromWishlist = asyncHandler(
  async (req, res, next) => {
    const { productId } = req.params;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { wishlist: productId } },
      { new: true }
    );

    return res.status(200).json({
      status: "success",
      message: "Product removed successfully from your wishlist",
      data: user.wishlist,
    });
  }
);

// @desc      Get logged user wishlist
// @route     GET /api/v1/wishlist/
// @access    Private/User
export const myWishlist = asyncHandler(async (req, res, next) => {
  const wishlist = await User.findById(req.user._id)
    .select("wishlist")
    .populate("wishlist");

  res.status(200).json({ status: "success", data: wishlist.wishlist });
});
