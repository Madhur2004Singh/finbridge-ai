import { Scheme } from "../models/Scheme.js";
import { FinancialProfile, NOT_COLLECTED } from "../models/FinancialProfile.js";

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
      if (user.occupation && s.targetOccupations?.includes(user.occupation)) {
        score += 4;
        reasons.push("occupation");
      }
      if (user.ageGroup && s.targetAgeGroups?.includes(user.ageGroup)) {
        score += 2;
        reasons.push("age group");
      }
      if (user.incomeRange && s.targetIncomeRanges?.includes(user.incomeRange)) {
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

const real = (value) => (value && value !== NOT_COLLECTED ? value : undefined);

/**
 * Recommendations prefer the survey-generated financial profile, falling back
 * to whatever the account already has. Unknown values are never assumed.
 */
export const getRecommendations = async (user, limit = 6) => {
  const [schemes, profile] = await Promise.all([
    Scheme.find({ active: true }),
    FinancialProfile.findOne({ userId: user.id }).lean(),
  ]);

  const effective = {
    occupation:
      real(profile?.demographics?.occupation) || user.occupation || undefined,
    ageGroup: real(profile?.demographics?.ageGroup) || user.ageGroup || undefined,
    incomeRange:
      real(profile?.financial?.incomeRange) || user.incomeRange || undefined,
  };

  return scoreSchemes(schemes, effective, limit);
};
