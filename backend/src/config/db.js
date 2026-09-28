import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

export const connectDB = async () => {
  if (!env.MONGO_URI) throw new Error("MONGO_URI not set");
  await mongoose.connect(env.MONGO_URI);
  logger.info(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);

  // --- Fix for orphan username_1 unique index (E11000 dup key: {username:null}) ---
  // Old schema used username unique; new schema uses email only.
  // If any DB still has username_1, drop it so 2nd signup with null doesn't fail.
  // This handles both `test` and `finbridge` DBs after migration.
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const names = collections.map((c) => c.name);
    if (names.includes("users")) {
      const indexes = await mongoose.connection.db.collection("users").indexes();
      const hasUsername = indexes.find((i) => i.name === "username_1");
      if (hasUsername) {
        await mongoose.connection.db.collection("users").dropIndex("username_1");
        logger.info("Dropped orphan index username_1 (fix E11000 null)");
      }
    }
  } catch (e) {
    logger.warn("Index cleanup skipped:", e.message);
  }
};

export const disconnectDB = () => mongoose.disconnect();
