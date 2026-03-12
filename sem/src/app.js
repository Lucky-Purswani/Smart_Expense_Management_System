import express from "express";
import cors from "cors";
import { ZodError } from "zod";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import compression from "compression";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import expenseWindowRoutes from "./routes/expenseWindow.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import "./jobs/windowReset.js";
import { globalLimiter } from "./middlewares/rateLimiter.middleware.js";


const app = express();


// ---------------- MIDDLEWARES ----------------
// Security
app.use(helmet());
app.use(cors());

// Body parser
app.use(express.json());

// Logging
app.use(morgan("dev"));

// Rate limit
// app.use(globalLimiter);
app.use(hpp());
app.use(compression());


// ---------------- ROUTES ----------------

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/windows", expenseWindowRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use((req, res) => {
  res.status(404).send("Route not found");
});

// ---------------- GLOBAL ERROR HANDLER ----------------
app.use((err, req, res, next) => {
  console.error(err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: err.issues[0]?.message || "Validation error",
    });
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

export default app;
