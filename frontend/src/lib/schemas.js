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
