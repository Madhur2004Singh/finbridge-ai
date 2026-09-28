import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";

const app = express();

// Security + CORS
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api", routes);

// Root
app.get("/", (_req, res) => {
  res.json({ success: true, message: "FinBridge API running", version: "2.0" });
});

// 404 + error handler (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;
