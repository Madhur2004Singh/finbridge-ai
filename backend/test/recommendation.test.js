import test from "node:test";
import assert from "node:assert/strict";
import { buildRecommendationProfile, scoreSchemes } from "../src/services/recommendation.service.js";

const schemes = [
  { slug: "farmer", targetOccupations: ["farmer"], targetAgeGroups: [], targetIncomeRanges: [], officialSource: "https://example.gov" },
  { slug: "other", targetOccupations: ["student"], targetAgeGroups: [], targetIncomeRanges: [] },
];

test("recommendations rank only schemes matching supplied profile data", () => {
  const result = scoreSchemes(schemes, { occupation: "farmer" });
  assert.deepEqual(result.map((item) => item.scheme.slug), ["farmer"]);
  assert.equal(result[0].scheme.officialSource, "https://example.gov");
});

test("incomplete and non-matching profiles do not produce assumed matches", () => {
  assert.deepEqual(scoreSchemes(schemes, {}), []);
  assert.deepEqual(scoreSchemes(schemes, { occupation: "not_collected" }), []);
  assert.deepEqual(scoreSchemes(schemes, { occupation: "homemaker" }), []);
});

test("NOT_COLLECTED survey fields do not fall back to stale account mirrors", () => {
  const effective = buildRecommendationProfile(
    { demographics: { occupation: "not_collected", ageGroup: "18-25" }, financial: { incomeRange: "not_collected" } },
    { occupation: "farmer", ageGroup: "60+", incomeRange: "above_60000" },
  );
  assert.equal(effective.occupation, undefined);
  assert.equal(effective.ageGroup, "18-25");
  assert.equal(effective.incomeRange, undefined);
  assert.deepEqual(buildRecommendationProfile(null, { occupation: "farmer" }), {
    occupation: "farmer", ageGroup: undefined, incomeRange: undefined,
  });
});
