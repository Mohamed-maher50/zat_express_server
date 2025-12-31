import { validationResult } from "express-validator";

// eslint-disable-next-line import/prefer-default-export
export const validatorMiddleware = (req, res, next) => {
  // Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
