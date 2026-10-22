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
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError(400, "Survey payload must be an object");
  }
  const answers = {};
  for (const f of SURVEY_FIELDS) {
    if (Object.hasOwn(body, f)) {
      const value = body[f];
      // Empty text/select values clear a scalar; [] explicitly clears a multi-select.
      answers[f] = value === "" ? null : value;
    }
  }

  const mergedAnswers = await SurveyResponse.findOne({ userId }).lean();
  const nextAnswers = { ...(mergedAnswers || {}), ...answers };
  const completionStatus = computeCompletion(nextAnswers);
  const completedAt = completionStatus === "complete"
    ? (mergedAnswers?.completedAt || new Date())
    : null;
  const update = { $set: { ...answers }, $unset: {} };
  if (completedAt) update.$set.completedAt = completedAt;
  else update.$unset.completedAt = 1;

  const responses = await SurveyResponse.findOneAndUpdate(
    { userId },
    update,
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  let profile;
  try {
    const profileDoc = generateProfileFromAnswers(userId, responses || answers);
    profile = await FinancialProfile.findOneAndUpdate(
      { userId },
      { $set: profileDoc },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    throw new ApiError(503, "Survey answers were saved, but profile generation failed. Please retry saving to synchronize your profile.");
  }

  // Synchronize only fields owned by the survey, including cleared values.
  const userFields = {
    ageGroup: "ageGroup",
    occupation: "occupation",
    incomeRange: "incomeRange",
    riskPreference: "riskPreference",
    state: "state",
    city: "city",
    goals: "financialGoals",
  };
  const mirrorSet = {};
  const mirrorUnset = {};
  for (const [answerField, userField] of Object.entries(userFields)) {
    if (!Object.hasOwn(answers, answerField)) continue;
    const value = responses[answerField];
    if (Array.isArray(value)) mirrorSet[userField] = value;
    else if (value === null || value === undefined || value === "") mirrorUnset[userField] = 1;
    else mirrorSet[userField] = value;
  }
  if (profile.completionStatus === "complete" && responses.completedAt) {
    mirrorSet.surveyCompletedAt = responses.completedAt;
  } else {
    mirrorUnset.surveyCompletedAt = 1;
  }
  const mirrorUpdate = {};
  if (Object.keys(mirrorSet).length) mirrorUpdate.$set = mirrorSet;
  if (Object.keys(mirrorUnset).length) mirrorUpdate.$unset = mirrorUnset;
  try {
    if (Object.keys(mirrorUpdate).length) await User.findByIdAndUpdate(userId, mirrorUpdate);
  } catch (error) {
    throw new ApiError(503, "Survey and financial profile were saved, but account synchronization failed. Please retry saving.");
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
