import test from "node:test";
import assert from "node:assert/strict";
import { computeCompletion, generateProfileFromAnswers } from "../src/services/survey.service.js";
import { SURVEY_FIELDS } from "../src/models/SurveyResponse.js";
import { NOT_COLLECTED } from "../src/models/FinancialProfile.js";

test("new survey defaults and empty arrays do not count as answers", () => {
  assert.equal(computeCompletion({ needs: [], goals: [] }), "not_started");
  assert.equal(computeCompletion({ ageGroup: null }), "not_started");
});

test("meaningful answers are partial and all 13 survey fields are required for complete", () => {
  assert.equal(computeCompletion({ ageGroup: "18-25" }), "partial");
  const complete = Object.fromEntries(SURVEY_FIELDS.map((field) => [field, "answered"]));
  complete.needs = ["none"];
  complete.goals = ["emergency_fund"];
  assert.equal(computeCompletion(complete), "complete");
  complete.goals = [];
  assert.equal(computeCompletion(complete), "partial");
});

test("profile regeneration uses NOT_COLLECTED and clears removed answer values", () => {
  const profile = generateProfileFromAnswers("user-1", {
    occupation: "farmer",
    state: null,
    needs: [],
    goals: [],
  });
  assert.equal(profile.demographics.occupation, "farmer");
  assert.equal(profile.demographics.state, NOT_COLLECTED);
  assert.equal(profile.demographics.ageGroup, NOT_COLLECTED);
  assert.deepEqual(profile.needs, []);
  assert.deepEqual(profile.goals, []);
  assert.equal(profile.completionStatus, "partial");
});
