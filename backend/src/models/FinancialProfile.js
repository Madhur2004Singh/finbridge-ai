import mongoose from "mongoose";

/** Value used whenever the survey never collected a field. */
export const NOT_COLLECTED = "not_collected";

/**
 * Structured financial profile generated from survey responses.
 * One document per user, linked to the logged-in account.
 * Unknown fields stay "not_collected" — never assumed.
 */
const financialProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    demographics: {
      ageGroup: { type: String, default: NOT_COLLECTED },
      occupation: { type: String, default: NOT_COLLECTED },
      state: { type: String, default: NOT_COLLECTED },
      city: { type: String, default: NOT_COLLECTED },
    },
    financial: {
      incomeRange: { type: String, default: NOT_COLLECTED },
      savingsHabit: { type: String, default: NOT_COLLECTED },
      expenditurePattern: { type: String, default: NOT_COLLECTED },
    },
    literacy: {
      upiUsage: { type: String, default: NOT_COLLECTED },
      digitalPaymentAwareness: { type: String, default: NOT_COLLECTED },
      financialSecurityKnowledge: { type: String, default: NOT_COLLECTED },
    },
    needs: { type: [String], default: [] },
    goals: { type: [String], default: [] },
    riskPreference: { type: String, default: NOT_COLLECTED },
    completionStatus: {
      type: String,
      enum: ["not_started", "partial", "complete"],
      default: "not_started",
      index: true,
    },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const FinancialProfile = mongoose.model(
  "FinancialProfile",
  financialProfileSchema
);
