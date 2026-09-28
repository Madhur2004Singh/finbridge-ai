import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

export const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const mapped = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return next(new ApiError(400, "Validation failed", mapped));
  }
  next();
};
