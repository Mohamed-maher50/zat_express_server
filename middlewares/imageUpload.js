import multer from "multer";
import ApiError from "../utils/apiError.js";

// Upload single image => method returns multer middleware
// eslint-disable-next-line import/prefer-default-export
export const uploadSingleImage = (fieldName) => {
  // Storage
  const multerStorage = multer.memoryStorage();

  // Accept only images
  const multerFilter = (_req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError("Only images allowed", 400), false);
    }
  };

  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

  return upload.single(fieldName);
};
