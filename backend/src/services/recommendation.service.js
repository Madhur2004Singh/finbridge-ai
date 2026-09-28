import { Scheme } from "../models/Scheme.js";

/**
 * Score schemes against user profile.
 * Occupation = 4 pts, ageGroup = 2, incomeRange = 2
 * Reusable across /schemes/recommendations and /dashboard
 */
export const scoreSchemes = (schemes, user, limit = 6) => {
  const scored = schemes
    .map((s) => {
      let score = 0;
      const reasons = [];
      if (s.targetOccupations?.includes(user.occupation)) {
        score += 4;
        reasons.push("occupation");
      }
      if (s.targetAgeGroups?.includes(user.ageGroup)) {
        score += 2;
        reasons.push("age group");
      }
      if (s.targetIncomeRanges?.includes(user.incomeRange)) {
        score += 2;
        reasons.push("income range");
      }
      return { scheme: s, score, reasons };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return scored;
};

export const getRecommendations = async (user, limit = 6) => {
  const schemes = await Scheme.find({ active: true });
  return scoreSchemes(schemes, user, limit);
};
