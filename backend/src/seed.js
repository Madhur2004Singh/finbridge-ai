import { connectDB, disconnectDB } from "./config/db.js";
import { seedSchemesSafely } from "./services/seed.service.js";
import { logger } from "./utils/logger.js";

try {
  await connectDB();
  await seedSchemesSafely();
  logger.info("Seed completed");
} catch (error) {
  logger.error("Seed failed:", error);
  process.exitCode = 1;
} finally {
  await disconnectDB();
}
