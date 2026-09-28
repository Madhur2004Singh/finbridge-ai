import { User } from "../models/User.js";
import { ALLOWED_PROFILE_FIELDS } from "../utils/constants.js";
import { ApiError } from "../utils/ApiError.js";

export const getProfile = async (userId) => {
  const user = await User.findById(userId).select("-passwordHash");
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

export const updateProfile = async (userId, body) => {
  const updates = {};
  for (const k of ALLOWED_PROFILE_FIELDS) {
    if (body[k] !== undefined) updates[k] = body[k];
  }
  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No valid profile fields provided");
  }

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  }).select("-passwordHash");

  if (!user) throw new ApiError(404, "User not found");
  return user;
};
