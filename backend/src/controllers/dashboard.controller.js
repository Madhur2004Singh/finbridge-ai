import { Expense } from "../models/Expense.js";
import { getRecommendations } from "../services/recommendation.service.js";
import { HTTP_STATUS } from "../utils/constants.js";

export const getDashboard = async (req, res) => {
  const userId = req.user.id;

  const [recentExpenses, allExpenses, recommendations] = await Promise.all([
    Expense.find({ userId }).sort({ date: -1 }).limit(5),
    Expense.find({ userId }),
    getRecommendations(req.user, 3),
  ]);

  const totalExpenses = allExpenses.reduce((sum, e) => sum + e.amount, 0);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    totalExpenses,
    recentExpenses,
    recommendations,
  });
};
