import { listExpenses, createExpense, deleteExpense } from "../services/expense.service.js";
import { HTTP_STATUS } from "../utils/constants.js";

export const getExpenses = async (req, res) => {
  const { expenses, total } = await listExpenses(req.user.id, req.query.month);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    expenses,
    total,
  });
};

export const addExpense = async (req, res) => {
  const expense = await createExpense(req.user.id, req.body);
  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Expense created",
    expense,
  });
};

export const removeExpense = async (req, res) => {
  await deleteExpense(req.user.id, req.params.id);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Deleted",
  });
};
