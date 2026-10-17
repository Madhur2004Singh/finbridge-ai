import { connectDB, disconnectDB } from "../config/db.js";
import { User } from "../models/User.js";
import { logger } from "../utils/logger.js";

/**
 * Promote (or demote) a user to admin:
 *   npm run make-admin -- user@example.com
 *   npm run make-admin -- user@example.com --demote
 */
const run = async () => {
  const email = (process.argv[2] || "").toLowerCase().trim();
  const demote = process.argv.includes("--demote");
  if (!email) {
    logger.error("Usage: npm run make-admin -- <email> [--demote]");
    process.exit(1);
  }

  await connectDB();
  const role = demote ? "user" : "admin";
  const user = await User.findOneAndUpdate(
    { email },
    { $set: { role } },
    { new: true }
  ).select("name email role");

  if (!user) {
    logger.error(`No user found with email ${email}`);
  } else {
    logger.info(`${user.email} is now role=${user.role}`);
  }

  await disconnectDB();
  process.exit(user ? 0 : 1);
};

run().catch((e) => {
  logger.error(e);
  process.exit(1);
});
