import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: { type: Date, required: true },
    amount: {
      type: Number,
      required: true,
      min: [0.01, "Amount must be positive"],
    },
    category: {
      type: String,
      default: "other",
      enum: ["food", "travel", "bills", "shopping", "education", "health", "savings", "other"],
    },
    note: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

expenseSchema.index({ userId: 1, date: -1 });

export const Expense = mongoose.model("Expense", expenseSchema);
