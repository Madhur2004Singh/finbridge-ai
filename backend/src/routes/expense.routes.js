import { Router } from "express";
import { body } from "express-validator";
import { getExpenses, addExpense, removeExpense } from "../controllers/expense.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(auth);

router.get("/", asyncHandler(getExpenses));

router.post(
  "/",
  [
    body("date").notEmpty().withMessage("Date is required").isISO8601().withMessage("Invalid date"),
    body("amount").isFloat({ gt: 0 }).withMessage("Amount must be positive"),
    body("category").optional().isString(),
    validate,
  ],
  asyncHandler(addExpense)
);

router.delete("/:id", asyncHandler(removeExpense));

export default router;
