import test from "node:test";
import assert from "node:assert/strict";
import { surveySchema } from "../src/lib/schemas.js";

test("survey schema accepts explicit scalar and multi-select clears", () => {
  const parsed = surveySchema.safeParse({ ageGroup: null, state: null, needs: [], goals: [] });
  assert.equal(parsed.success, true);
});

test("survey schema rejects invalid enum values and malformed arrays", () => {
  assert.equal(surveySchema.safeParse({ occupation: "banker" }).success, false);
  assert.equal(surveySchema.safeParse({ needs: ["unknown"] }).success, false);
  assert.equal(surveySchema.safeParse({ goals: [""] }).success, false);
});
