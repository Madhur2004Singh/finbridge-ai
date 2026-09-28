import { registerUser, loginUser } from "../services/auth.service.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP_STATUS } from "../utils/constants.js";

export const register = async (req, res) => {
  const result = await registerUser(req.body);
  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Registration successful",
    token: result.token,
    user: result.user,
  });
};

export const login = async (req, res) => {
  const result = await loginUser(req.body);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Login successful",
    token: result.token,
    user: result.user,
  });
};

export const me = async (req, res) => {
  // req.user populated by auth middleware
  res.status(HTTP_STATUS.OK).json({
    success: true,
    user: req.user,
  });
};
