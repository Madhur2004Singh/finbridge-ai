import { Scheme } from "../models/Scheme.js";
import { ApiError } from "../utils/ApiError.js";

export const listSchemes = async (filters = {}) => {
  const query = { active: true };
  if (filters.category) query.category = filters.category;
  if (filters.occupation) query.targetOccupations = filters.occupation;
  if (filters.incomeRange) query.targetIncomeRanges = filters.incomeRange;
  return Scheme.find(query).sort({ createdAt: 1 });
};

export const getSchemeBySlug = async (slug) => {
  const scheme = await Scheme.findOne({ slug, active: true });
  if (!scheme) throw new ApiError(404, "Scheme not found");
  return scheme;
};
