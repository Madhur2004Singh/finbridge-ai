import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    ageGroup: {
      type: String,
      default: "18-25",
      enum: ["18-25", "26-40", "41-60", "60+", "other"],
    },
    occupation: {
      type: String,
      default: "other",
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
    incomeRange: {
      type: String,
      default: "below_15000",
      enum: ["below_15000", "15000_30000", "30000_60000", "above_60000"],
    },
    state: { type: String, trim: true },
    language: { type: String, default: "en", enum: ["en", "hi", "kn"] },
    financialGoals: [{ type: String }],
    riskPreference: {
      type: String,
      default: "low",
      enum: ["low", "medium", "high"],
    },
  },
  { timestamps: true }
);

// Explicit index: ensure only email unique (no legacy username index)
// Mongoose will create this; orphan username_1 is dropped at startup in config/db.js
userSchema.index({ email: 1 }, { unique: true });

// Remove sensitive fields in JSON
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

export const User = mongoose.model("User", userSchema);
