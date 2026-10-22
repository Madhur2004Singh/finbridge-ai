import mongoose from "mongoose";

/**
 * Raw survey answers, one document per user (unique userId).
 * Kept separate from authentication data (User).
 *
 * Survey questions:
 *  1  ageGroup
 *  2  occupation
 *  3  state + city
 *  4  incomeRange
 *  5  savingsHabit
 *  6  expenditurePattern
 *  7  upiUsage
 *  8  digitalPaymentAwareness
 *  9  financialSecurityKnowledge
 * 10  needs[]
 * 11  goals[]
 * 12  riskPreference
 */
const surveySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    ageGroup: {
      type: String,
      enum: ["18-25", "26-40", "41-60", "60+", "other"],
    },
    occupation: {
      type: String,
      enum: [
        "student",
        "salaried",
        "small_business",
        "farmer",
        "daily_wage",
        "homemaker",
        "senior_citizen",
        "other",
      ],
    },
    state: { type: String, trim: true, maxlength: 60 },
    city: { type: String, trim: true, maxlength: 60 },
    incomeRange: {
      type: String,
      enum: ["below_15000", "15000_30000", "30000_60000", "above_60000"],
    },
    savingsHabit: {
      type: String,
      enum: ["regular", "occasional", "rarely", "never"],
    },
    expenditurePattern: {
      type: String,
      enum: ["balanced", "spend_more", "save_more", "unsure"],
    },
    upiUsage: { type: String, enum: ["daily", "weekly", "rarely", "never"] },
    digitalPaymentAwareness: {
      type: String,
      enum: ["full", "some", "basic", "none"],
    },
    financialSecurityKnowledge: {
      type: String,
      enum: ["full", "partial", "none"],
    },
    needs: [
      {
        type: String,
        enum: [
          "insurance",
          "pension",
          "credit",
          "govt_schemes",
          "investment",
          "none",
        ],
      },
    ],
    goals: [{ type: String, trim: true, maxlength: 60 }],
    riskPreference: { type: String, enum: ["low", "medium", "high"] },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

// Strip duplicates / empty strings from multi-select answers
surveySchema.pre("validate", function (next) {
  if (Array.isArray(this.needs)) {
    this.needs = [...new Set(this.needs.filter(Boolean))];
  }
  if (Array.isArray(this.goals)) {
    this.goals = [
      ...new Set(this.goals.map((g) => String(g).trim()).filter(Boolean)),
    ].slice(0, 10);
  }
  next();
});

export const SurveyResponse = mongoose.model("SurveyResponse", surveySchema);

/** The 13 answer keys that count toward completion status. */
export const SURVEY_FIELDS = [
  "ageGroup",
  "occupation",
  "state",
  "city",
  "incomeRange",
  "savingsHabit",
  "expenditurePattern",
  "upiUsage",
  "digitalPaymentAwareness",
  "financialSecurityKnowledge",
  "needs",
  "goals",
  "riskPreference",
];
