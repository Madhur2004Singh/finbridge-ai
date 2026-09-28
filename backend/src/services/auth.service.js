import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

export const signToken = (userId) =>
  jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

export const registerUser = async ({ name, email, password }) => {
  if (!name || !email || !password || password.length < 8) {
    throw new ApiError(400, "Name, email and 8+ character password are required");
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Pre-check for friendly 409
  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) throw new ApiError(409, "Email already registered");

  try {
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(password, 12),
    });
    const safe = user.toSafeObject();
    return { token: signToken(user.id), user: safe };
  } catch (err) {
    // Handle race-case duplicate (concurrent requests) + legacy username index
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0];
      if (field === "email") throw new ApiError(409, "Email already registered");
      if (field === "username") {
        // Legacy orphan index – should have been dropped by connectDB cleanup
        throw new ApiError(
          500,
          "Database index misconfiguration (username_1). Please contact support / drop orphan index."
        );
      }
      throw new ApiError(409, `${field} already exists`);
    }
    throw err;
  }
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) throw new ApiError(400, "Email and password are required");

  // passwordHash is select:false so explicitly include
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    "+passwordHash"
  );
  if (!user || !(await bcrypt.compare(password || "", user.passwordHash))) {
    throw new ApiError(401, "Invalid email or password");
  }
  const safe = user.toSafeObject();
  return { token: signToken(user.id), user: safe };
};
