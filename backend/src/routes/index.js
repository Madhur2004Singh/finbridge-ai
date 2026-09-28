import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import schemeRoutes from "./scheme.routes.js";
import expenseRoutes from "./expense.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import healthRoutes from "./health.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/schemes", schemeRoutes);
router.use("/expenses", expenseRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
