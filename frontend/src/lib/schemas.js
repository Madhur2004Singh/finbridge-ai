import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const expenseSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  category: z.string().min(1),
  note: z.string().max(500).optional(),
  date: z.string().min(1, "Date is required"),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Name too short").max(50).optional(),
  ageGroup: z.enum(["18-25", "26-40", "41-60", "60+", ""]).optional(),
  occupation: z
    .enum([
      "student",
      "salaried",
      "small_business",
      "farmer",
      "daily_wage",
      "homemaker",
      "senior_citizen",
      "other",
      "",
    ])
    .optional(),
  incomeRange: z
    .enum(["below_15000", "15000_30000", "30000_60000", "above_60000", ""])
    .optional(),
  state: z.string().max(50).optional(),
  language: z.enum(["en", "hi", "kn"]).optional(),
});

// --- Survey -----------------------------------------------------------------
// Values must be "" (unanswered) or one of the allowed enum values, so
// inconsistent data can never be submitted to the backend.
const optionalEnum = (values, message) =>
  z
    .string()
    .nullable()
    .refine((v) => v === null || v === "" || values.includes(v), message)
    .optional();

export const SURVEY_OPTIONS = {
  ageGroup: ["18-25", "26-40", "41-60", "60+", "other"],
  occupation: [
    "student",
    "salaried",
    "small_business",
    "farmer",
    "daily_wage",
    "homemaker",
    "senior_citizen",
    "other",
  ],
  incomeRange: ["below_15000", "15000_30000", "30000_60000", "above_60000"],
  savingsHabit: ["regular", "occasional", "rarely", "never"],
  expenditurePattern: ["balanced", "spend_more", "save_more", "unsure"],
  upiUsage: ["daily", "weekly", "rarely", "never"],
  digitalPaymentAwareness: ["full", "some", "basic", "none"],
  financialSecurityKnowledge: ["full", "partial", "none"],
  needs: ["insurance", "pension", "credit", "govt_schemes", "investment", "none"],
  riskPreference: ["low", "medium", "high"],
};

export const surveySchema = z.object({
  ageGroup: optionalEnum(SURVEY_OPTIONS.ageGroup, "Invalid age group"),
  occupation: optionalEnum(SURVEY_OPTIONS.occupation, "Invalid occupation"),
  state: z.string().max(60, "State is too long").nullable().optional(),
  city: z.string().max(60, "City is too long").nullable().optional(),
  incomeRange: optionalEnum(SURVEY_OPTIONS.incomeRange, "Invalid income range"),
  savingsHabit: optionalEnum(SURVEY_OPTIONS.savingsHabit, "Invalid savings habit"),
  expenditurePattern: optionalEnum(
    SURVEY_OPTIONS.expenditurePattern,
    "Invalid expenditure pattern"
  ),
  upiUsage: optionalEnum(SURVEY_OPTIONS.upiUsage, "Invalid UPI usage"),
  digitalPaymentAwareness: optionalEnum(
    SURVEY_OPTIONS.digitalPaymentAwareness,
    "Invalid digital payment awareness"
  ),
  financialSecurityKnowledge: optionalEnum(
    SURVEY_OPTIONS.financialSecurityKnowledge,
    "Invalid financial security knowledge"
  ),
  needs: z.array(z.enum(SURVEY_OPTIONS.needs)).max(6).optional(),
  goals: z
    .array(z.string().trim().min(1).max(60))
    .max(10, "At most 10 goals")
    .optional(),
  riskPreference: optionalEnum(SURVEY_OPTIONS.riskPreference, "Invalid risk preference"),
});

// --- Blog -------------------------------------------------------------------
export const blogSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(160),
  content: z.string().trim().min(10, "Content is too short").max(50000),
  image: z.string().optional(),
});

export const commentSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment is too long"),
});

/** Returns { data, fieldErrors } without throwing. */
export function validateWith(schema, values) {
  const result = schema.safeParse(values);
  if (result.success) return { data: result.data, fieldErrors: {} };
  const fieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join(".") || "form";
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { data: null, fieldErrors };
}
