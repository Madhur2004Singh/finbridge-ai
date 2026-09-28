import { Router } from "express";
import { getSchemes, getScheme, getRecommendedSchemes } from "../controllers/scheme.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// IMPORTANT: /recommendations must be before /:slug else it's captured as slug
router.get("/recommendations", auth, asyncHandler(getRecommendedSchemes));
router.get("/", asyncHandler(getSchemes));
router.get("/:slug", asyncHandler(getScheme));

export default router;
