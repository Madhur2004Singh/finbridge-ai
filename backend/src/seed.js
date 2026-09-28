import { connectDB } from "./config/db.js";
import { reseedSchemes } from "./services/seed.service.js";
import { logger } from "./utils/logger.js";

await connectDB();
await reseedSchemes();
logger.info("Seed completed");
process.exit(0);