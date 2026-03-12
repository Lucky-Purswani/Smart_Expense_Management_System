import { PrismaClient } from "@prisma/client";
import { config } from "./env.js";

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: config.env === "development"
      ? ["query", "error", "warn"]
      : ["error"],
  });

if (config.env !== "production") {
  globalForPrisma.prisma = prisma;
}



/**
 * Prisma Singleton Setup
 *
 * This file creates and exports a single Prisma Client instance
 * to be used across the entire application.
 * Basically whenever we make changes in code it prevents again n again req making to db.
 *
 * globalThis is Node.js’s global object (like a global storage container).
 * Initially, globalThis.__prisma__ is undefined.
 *
 * When the server starts for the first time, a new PrismaClient is created.
 * In development mode, we store that instance on globalThis.__prisma__.
 *
 * During hot reloads (nodemon), files are re-executed,
 * but the global object persists — so instead of creating
 * multiple Prisma connections, we reuse the existing one.
 *
 * This prevents unnecessary database connections and memory leaks in development.
 *
 * In production, this is not needed because the server runs once
 * (no hot reload), so only a single Prisma instance is created naturally.
 */
