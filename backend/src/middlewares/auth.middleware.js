import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

export const auth = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication required");
    }
    const token = header.slice(7);
    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(payload.userId).select("-passwordHash");
    if (!user) throw new ApiError(401, "Invalid or expired token");
    req.user = user;
    next();
  } catch (e) {
    if (e instanceof ApiError) return next(e);
    return next(new ApiError(401, "Invalid or expired token"));
  }
};
