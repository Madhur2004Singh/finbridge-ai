import { ApiError } from "../utils/ApiError.js";

export const errorHandler = (err, _req, res, _next) => {
  // Mongoose duplicate key (e.g., email unique)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    const message = `${field} already exists`;
    return res.status(409).json({
      success: false,
      message,
      errors: [{ field, message }],
    });
  }

  // Mongoose validation
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // Custom ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  // Fallback
  console.error("[unhandled]", err);
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};
