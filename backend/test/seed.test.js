import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { Scheme } from "../src/models/Scheme.js";
import { seedSchemesSafely } from "../src/services/seed.service.js";

const originalCount = Scheme.countDocuments;
const originalBulkWrite = Scheme.bulkWrite;
let records;
let bulkCalls;

afterEach(() => {
  Scheme.countDocuments = originalCount;
  Scheme.bulkWrite = originalBulkWrite;
});

test("seeding inserts missing slugs once, preserves existing records, and is repeatable", async () => {
  records = new Map();
  bulkCalls = 0;
  Scheme.countDocuments = async () => records.size;
  Scheme.bulkWrite = async (operations) => {
    bulkCalls += 1;
    let upsertedCount = 0;
    for (const operation of operations) {
      const { filter, update } = operation.updateOne;
      if (!records.has(filter.slug)) {
        records.set(filter.slug, update.$setOnInsert);
        upsertedCount += 1;
      }
    }
    return { upsertedCount };
  };

  const first = await seedSchemesSafely();
  const existingSlug = records.keys().next().value;
  records.set(existingSlug, { ...records.get(existingSlug), name: { en: "User edited record" } });
  const second = await seedSchemesSafely();
  assert.ok(first.inserted > 0);
  assert.equal(second.inserted, 0);
  assert.equal(records.size, first.inserted);
  assert.equal(bulkCalls, 2);
  assert.equal(records.get(existingSlug).name.en, "User edited record");
  assert.ok([...records.values()].every((record) => record.name.hi === undefined && record.name.kn === undefined));
});

test("seed failure is allowed to propagate to the command entry point", async () => {
  Scheme.countDocuments = async () => 0;
  Scheme.bulkWrite = async () => { throw new Error("write failed"); };
  await assert.rejects(seedSchemesSafely(), /write failed/);
});
