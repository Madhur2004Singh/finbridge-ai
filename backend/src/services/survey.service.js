import { SurveyResponse, SURVEY_FIELDS } from "../models/SurveyResponse.js";
import { FinancialProfile, NOT_COLLECTED } from "../models/FinancialProfile.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

const isAnswered = (value) =>
  Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && value !== "";

/** complete = every question answered, partial = some, not_started = none */
export const computeCompletion = (answers = {}) => {
  const answered = SURVEY_FIELDS.filter((f) => isAnswered(answers[f])).length;
  if (answered === 0) return "not_started";
  if (answered === SURVEY_FIELDS.length) return "complete";
  return "partial";
};

const pick = (value) => (isAnswered(value) ? value : NOT_COLLECTED);

/**
 * Build the structured profile from raw survey answers.
 * Only fields actually collected by the survey are included;
 * everything else is explicitly "not_collected".
 */
export const generateProfileFromAnswers = (userId, answers = {}) => {
  const completionStatus = computeCompletion(answers);

  return {
    userId,
    demographics: {
      ageGroup: pick(answers.ageGroup),
      occupation: pick(answers.occupation),
      state: pick(answers.state),
      city: pick(answers.city),
    },
    financial: {
      incomeRange: pick(answers.incomeRange),
      savingsHabit: pick(answers.savingsHabit),
      expenditurePattern: pick(answers.expenditurePattern),
    },
    literacy: {
      upiUsage: pick(answers.upiUsage),
      digitalPaymentAwareness: pick(answers.digitalPaymentAwareness),
      financialSecurityKnowledge: pick(answers.financialSecurityKnowledge),
    },
    needs: answers.needs || [],
    goals: answers.goals || [],
    riskPreference: pick(answers.riskPreference),
    completionStatus,
    generatedAt: new Date(),
  };
};

/**
 * Save responses for a user, regenerate their profile, and mirror the
 * demographic/financial fields onto the User doc so scheme
 * recommendations and the account profile stay consistent.
 */
export const saveSurveyForUser = async (userId, body) => {
  const answers = {};
  for (const f of SURVEY_FIELDS) {
    if (body[f] !== undefined) answers[f] = body[f];
  }

  const responses = await SurveyResponse.findOneAndUpdate(
    { userId },
    { $set: { ...answers, completedAt: new Date() } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  const profileDoc = generateProfileFromAnswers(userId, responses || answers);
  const profile = await FinancialProfile.findOneAndUpdate(
    { userId },
    { $set: profileDoc },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  // Mirror only real values onto the user (never "not_collected")
  const mirror = {};
  if (responses?.ageGroup) mirror.ageGroup = responses.ageGroup;
  if (responses?.occupation) mirror.occupation = responses.occupation;
  if (responses?.incomeRange) mirror.incomeRange = responses.incomeRange;
  if (responses?.riskPreference) mirror.riskPreference = responses.riskPreference;
  if (responses?.state) mirror.state = responses.state;
  if (responses?.city) mirror.city = responses.city;
  if (responses?.goals?.length) mirror.financialGoals = responses.goals;
  if (profile.completionStatus === "complete") {
    mirror.surveyCompletedAt = new Date();
  }
  if (Object.keys(mirror).length > 0) {
    await User.findByIdAndUpdate(userId, { $set: mirror });
  }

  return { responses, profile };
};

export const getSurveyForUser = async (userId) => {
  const [responses, profile] = await Promise.all([
    SurveyResponse.findOne({ userId }).lean(),
    FinancialProfile.findOne({ userId }).lean(),
  ]);
  return {
    responses: responses || null,
    profile: profile || null,
    status: profile?.completionStatus || "not_started",
  };
};

export const regenerateProfile = async (userId) => {
  const responses = await SurveyResponse.findOne({ userId }).lean();
  if (!responses) throw new ApiError(404, "No survey responses found for this user");
  const profileDoc = generateProfileFromAnswers(userId, responses);
  const profile = await FinancialProfile.findOneAndUpdate(
    { userId },
    { $set: profileDoc },
    { new: true, upsert: true, runValidators: true }
  );
  return profile;
};
