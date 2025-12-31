const express = require("express");
const {
  getProduct,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const {
  createProductValidator,
  getProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require("../utils/validators/productValidator");

const authController = require("../controllers/authController");
const reviewRoute = require("./reviewRoute");
const {
  executeDeletedMiddleware,
} = require("../middlewares/softDeleteMiddleware");

const router = express.Router();

// POST  /products/n1b1213ga2/reviews
// GET   /products/n1b1213ga2/reviews
// GET   /products/n1b1213ga2/reviews/jjh132hh4
router.use("/:productId/reviews", reviewRoute);

router
  .route("/")
  .get(executeDeletedMiddleware, getProducts)
  .post(
    authController.auth,
    authController.allowedTo("admin", "manager"),
    createProductValidator,
    createProduct
  );

// router.use(idValidation);
router
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(
    authController.auth,
    authController.allowedTo("admin", "manager"),
    updateProductValidator,
    updateProduct
  )
  .delete(
    authController.auth,
    authController.allowedTo("admin"),
    deleteProductValidator,
    deleteProduct
  );

module.exports = router;
