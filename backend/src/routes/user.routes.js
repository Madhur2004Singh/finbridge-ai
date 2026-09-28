import { Router } from "express";
import { patchProfile } from "../controllers/user.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// All user routes are protected
router.use(auth);

router.patch("/profile", asyncHandler(patchProfile));

export default router;
