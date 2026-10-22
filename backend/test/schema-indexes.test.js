import test from "node:test";
import assert from "node:assert/strict";
import { Scheme } from "../src/models/Scheme.js";
import { User } from "../src/models/User.js";

const indexesFor = (model, field) => model.schema.indexes().filter(([keys]) => keys[field] === 1);

test("scheme slug has exactly one unique index declaration", () => {
  const indexes = indexesFor(Scheme, "slug");
  assert.equal(indexes.length, 1);
  assert.equal(indexes[0][1].unique, true);
});

test("user email has exactly one unique index declaration", () => {
  const indexes = indexesFor(User, "email");
  assert.equal(indexes.length, 1);
  assert.equal(indexes[0][1].unique, true);
});
