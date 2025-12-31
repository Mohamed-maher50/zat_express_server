/**
 * ApiError class for operational errors
 * Extends Error to handle predictable application errors
 */
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith(4) ? "fail" : "error";
    this.isOperational = true;

    // Capture stack trace for debugging (optional)
    // Error.captureStackTrace(this, this.constructor);

    // Set prototype explicitly for better instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export default ApiError;
