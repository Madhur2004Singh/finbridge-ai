import mongoose from "mongoose";

const L = new mongoose.Schema(
  { en: String, hi: String, kn: String },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    ageGroup: { type: String, default: "18-25" },
    occupation: { type: String, default: "other" },
    incomeRange: { type: String, default: "below_15000" },
    state: String,
    language: { type: String, default: "en" },
    financialGoals: [String],
    riskPreference: { type: String, default: "low" },
  },
  { timestamps: true }
);

const schemeSchema = new mongoose.Schema(
  {
    slug: { type: String, unique: true },
    name: L,
    category: String,
    targetOccupations: [String],
    targetAgeGroups: [String],
    targetIncomeRanges: [String],
    description: L,
    eligibility: [L],
    benefits: [L],
    documentsRequired: [L],
    applicationSteps: [L],
    officialSource: String,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const expenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    date: Date,
    amount: { type: Number, min: 0.01 },
    category: String,
    note: String,
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
export const Scheme = mongoose.model("Scheme", schemeSchema);
export const Expense = mongoose.model("Expense", expenseSchema);