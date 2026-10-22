import { Router } from "express";
import { body } from "express-validator";
import {
  getSurvey,
  getStatus,
  submitSurvey,
  postRegenerateProfile,
} from "../controllers/survey.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// Survey data belongs to the authenticated user only
router.use(auth);

const enumCheck = (field, values) =>
  body(field)
    .optional({ values: "null" })
    .isIn(values)
    .withMessage(`${field} must be one of: ${values.join(", ")}`);

const arrayEnumCheck = (field, values) =>
  body(field)
    .optional({ values: "null" })
    .isArray({ max: 20 })
    .withMessage(`${field} must be an array`)
    .bail()
    .custom((arr) => arr.every((v) => values.includes(v)))
    .withMessage(`${field} contains an invalid value`);

// Validation prevents inconsistent/unknown values from reaching MongoDB
export const surveyValidators = [
  enumCheck("ageGroup", ["18-25", "26-40", "41-60", "60+", "other"]),
  enumCheck("occupation", [
    "student",
    "salaried",
    "small_business",
    "farmer",
    "daily_wage",
    "homemaker",
    "senior_citizen",
    "other",
  ]),
  body("state").optional({ values: "falsy" }).isString().trim().isLength({ max: 60 }).withMessage("State is too long"),
  body("city").optional({ values: "falsy" }).isString().trim().isLength({ max: 60 }).withMessage("City is too long"),
  enumCheck("incomeRange", ["below_15000", "15000_30000", "30000_60000", "above_60000"]),
  enumCheck("savingsHabit", ["regular", "occasional", "rarely", "never"]),
  enumCheck("expenditurePattern", ["balanced", "spend_more", "save_more", "unsure"]),
  enumCheck("upiUsage", ["daily", "weekly", "rarely", "never"]),
  enumCheck("digitalPaymentAwareness", ["full", "some", "basic", "none"]),
  enumCheck("financialSecurityKnowledge", ["full", "partial", "none"]),
  arrayEnumCheck("needs", [
    "insurance",
    "pension",
    "credit",
    "govt_schemes",
    "investment",
    "none",
  ]),
  body("goals")
    .optional({ values: "null" })
    .isArray({ max: 10 })
    .withMessage("goals must be an array of at most 10 items")
    .bail()
    .custom((arr) => arr.every((v) => typeof v === "string" && v.trim().length > 0 && v.length <= 60))
    .withMessage("each goal must be a non-empty string of at most 60 characters"),
  enumCheck("riskPreference", ["low", "medium", "high"]),
  validate,
];

router.get("/", asyncHandler(getSurvey));
router.get("/status", asyncHandler(getStatus));
router.put("/", surveyValidators, asyncHandler(submitSurvey));
router.post("/profile", asyncHandler(postRegenerateProfile));

export default router;
