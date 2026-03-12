import dotenv from "dotenv";

dotenv.config(); // ALWAYS load .env

const required = ["DATABASE_URL", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}

export const config = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY
  }
};