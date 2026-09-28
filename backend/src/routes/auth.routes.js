import { Router } from "express";
import { body } from "express-validator";
import { register, login, me } from "../controllers/auth.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    validate,
  ],
  asyncHandler(register)
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
    validate,
  ],
  asyncHandler(login)
);

router.get("/me", auth, asyncHandler(me));

export default router;
