import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

export const auth = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new ApiError(401, "Authentication required"));
  }

  const token = header.slice(7);

  // 1) Verify the token itself — distinguish expiry from garbage tokens
  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET);
  } catch (e) {
    if (e?.name === "TokenExpiredError") {
      return next(new ApiError(401, "Session expired. Please log in again."));
    }
    return next(new ApiError(401, "Invalid token. Please log in again."));
  }

  // 2) Load the user — DB failures must NOT be reported as 401
  let user;
  try {
    user = await User.findById(payload.userId).select("-passwordHash");
  } catch (e) {
    return next(e);
  }

  if (!user) {
    return next(new ApiError(401, "Account no longer exists. Please log in again."));
  }

  req.user = user;
  next();
};

/** Route guard for admin-only endpoints (e.g. blog create/edit). */
export const adminOnly = (req, _res, next) => {
  if (req.user?.role !== "admin") {
    return next(new ApiError(403, "Admin access required"));
  }
  next();
};

/**
 * Attach req.user when a valid token is present, but never block the request.
 * Used for public reads that behave differently for admins (e.g. blog drafts).
 */
export const optionalAuth = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return next();
  try {
    const payload = jwt.verify(header.slice(7), env.JWT_SECRET);
    req.user = await User.findById(payload.userId).select("-passwordHash");
  } catch {
    // ignore — treated as anonymous
  }
  next();
};
