import test from "node:test";
import assert from "node:assert/strict";
import { validationResult } from "express-validator";
import { surveyValidators } from "../src/routes/survey.routes.js";

const validateBody = async (body) => {
  const req = { body, params: {}, query: {}, headers: {} };
  await Promise.all(surveyValidators.slice(0, -1).map((validator) => validator.run(req)));
  return validationResult(req).array();
};

test("backend validation accepts explicit clear values", async () => {
  assert.deepEqual(await validateBody({ ageGroup: null, state: null, city: "", needs: [], goals: [] }), []);
});

test("backend validation rejects invalid enums and malformed answer arrays", async () => {
  const errors = await validateBody({ occupation: "banker", needs: ["unknown"], goals: [""] });
  assert.ok(errors.some((error) => error.path === "occupation"));
  assert.ok(errors.some((error) => error.path === "needs"));
  assert.ok(errors.some((error) => error.path === "goals"));
});
