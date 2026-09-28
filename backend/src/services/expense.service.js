import { Expense } from "../models/Expense.js";
import { ApiError } from "../utils/ApiError.js";

export const listExpenses = async (userId, month) => {
  const filter = { userId };
  if (/^\d{4}-\d{2}$/.test(month || "")) {
    const start = new Date(month + "-01T00:00:00Z");
    const end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + 1);
    filter.date = { $gte: start, $lt: end };
  }
  const expenses = await Expense.find(filter).sort({ date: -1 });
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  return { expenses, total };
};

export const createExpense = async (userId, { date, amount, category, note }) => {
  if (!date || Number(amount) <= 0) {
    throw new ApiError(400, "Date and positive amount required");
  }
  const expense = await Expense.create({
    userId,
    date: new Date(date),
    amount: Number(amount),
    category: category || "other",
    note,
  });
  return expense;
};

export const deleteExpense = async (userId, expenseId) => {
  const doc = await Expense.findOneAndDelete({ _id: expenseId, userId });
  if (!doc) throw new ApiError(404, "Expense not found");
  return doc;
};
