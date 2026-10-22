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

export const buildRecommendationProfile = (profile, user = {}) => ({
  // Once a survey profile exists, it is authoritative, including its unknowns.
  occupation: profile
    ? real(profile.demographics?.occupation)
    : real(user.occupation),
  ageGroup: profile
    ? real(profile.demographics?.ageGroup)
    : real(user.ageGroup),
  incomeRange: profile
    ? real(profile.financial?.incomeRange)
    : real(user.incomeRange),
});

/**
 * Recommendations use a survey-generated profile when present; account values
 * are only a fallback for users without a generated survey profile.
 */
export const getRecommendations = async (user, limit = 6) => {
  const [schemes, profile] = await Promise.all([
    Scheme.find({ active: true }),
    FinancialProfile.findOne({ userId: user.id }).lean(),
  ]);

  const effective = buildRecommendationProfile(profile, user);

  return scoreSchemes(schemes, effective, limit);
};
