import "dotenv/config";

const required = ["MONGO_URI", "JWT_SECRET"];
for (const k of required) {
  if (!process.env[k]) {
    console.warn(`[env] Missing required ${k}`);
  }
}

export const env = {
  PORT: Number(process.env.PORT || 5000),
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  NODE_ENV: process.env.NODE_ENV || "development",
};
