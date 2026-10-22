import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { SurveyResponse } from "../src/models/SurveyResponse.js";
import { FinancialProfile } from "../src/models/FinancialProfile.js";
import { User } from "../src/models/User.js";
import { saveSurveyForUser } from "../src/services/survey.service.js";

const originals = {
  findOne: SurveyResponse.findOne,
  findOneAndUpdate: SurveyResponse.findOneAndUpdate,
  profileUpdate: FinancialProfile.findOneAndUpdate,
  userUpdate: User.findByIdAndUpdate,
};
let stored;
let savedFilter;
let savedUpdate;
let userUpdate;

const arrangeStore = (initial = null) => {
  stored = initial;
  SurveyResponse.findOne = (filter) => ({ lean: async () => {
    assert.deepEqual(filter, { userId: "owner-id" });
    return stored ? { ...stored } : null;
  } });
  SurveyResponse.findOneAndUpdate = async (filter, update) => {
    savedFilter = filter;
    savedUpdate = update;
    stored = { ...(stored || {}), ...update.$set };
    for (const field of Object.keys(update.$unset || {})) delete stored[field];
    return { ...stored };
  };
  FinancialProfile.findOneAndUpdate = async (_filter, update) => ({ ...update.$set });
  User.findByIdAndUpdate = async (userId, update) => {
    userUpdate = { userId, update };
  };
};

afterEach(() => {
  SurveyResponse.findOne = originals.findOne;
  SurveyResponse.findOneAndUpdate = originals.findOneAndUpdate;
  FinancialProfile.findOneAndUpdate = originals.profileUpdate;
  User.findByIdAndUpdate = originals.userUpdate;
});

test("creates a response, profile, and user-scoped account mirrors", async () => {
  arrangeStore();
  const { responses, profile } = await saveSurveyForUser("owner-id", {
    userId: "attacker-id", passwordHash: "must-not-be-assigned",
    ageGroup: "18-25", occupation: "farmer", needs: ["insurance"], goals: ["emergency_fund"],
  });
  assert.equal(responses.ageGroup, "18-25");
  assert.equal(profile.demographics.occupation, "farmer");
  assert.deepEqual(savedFilter, { userId: "owner-id" });
  assert.equal(savedUpdate.$set.userId, undefined);
  assert.equal(savedUpdate.$set.passwordHash, undefined);
  assert.deepEqual(userUpdate.update.$set, {
    ageGroup: "18-25", occupation: "farmer", financialGoals: ["emergency_fund"],
  });
});

test("partial updates preserve unrelated answers", async () => {
  arrangeStore({ occupation: "farmer", state: "Karnataka", ageGroup: "18-25", needs: ["credit"] });
  const { responses } = await saveSurveyForUser("owner-id", { state: "Kerala" });
  assert.equal(responses.occupation, "farmer");
  assert.equal(responses.ageGroup, "18-25");
  assert.equal(responses.state, "Kerala");
  assert.deepEqual(responses.needs, ["credit"]);
  assert.deepEqual(savedUpdate.$set, { state: "Kerala" });
});

test("clears scalar and multi-select answers and unsets stale mirrors", async () => {
  arrangeStore({ occupation: "farmer", ageGroup: "18-25", needs: ["credit"], goals: ["education"] });
  const { responses, profile } = await saveSurveyForUser("owner-id", {
    occupation: null, needs: [], goals: [],
  });
  assert.equal(responses.occupation, null);
  assert.deepEqual(responses.needs, []);
  assert.deepEqual(responses.goals, []);
  assert.equal(profile.demographics.occupation, "not_collected");
  assert.deepEqual(userUpdate.update.$unset, { occupation: 1, surveyCompletedAt: 1 });
  assert.deepEqual(userUpdate.update.$set.financialGoals, []);
});
