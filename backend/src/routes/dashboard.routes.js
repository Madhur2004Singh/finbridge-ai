import { Router } from "express";
import { getDashboard } from "../controllers/dashboard.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", auth, asyncHandler(getDashboard));

export default router;
