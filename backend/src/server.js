import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import app from "./app.js";
import { seedSchemesIfEmpty } from "./services/seed.service.js";
import { logger } from "./utils/logger.js";

const start = async () => {
  try {
    await connectDB();
    await seedSchemesIfEmpty();

    app.listen(env.PORT, () => {
      logger.info(`API running on http://localhost:${env.PORT}`);
      logger.info(`Env: ${env.NODE_ENV} | Client: ${env.CLIENT_URL}`);
    });
  } catch (err) {
    logger.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();
