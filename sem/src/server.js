import app from "./app.js";
import { config } from "./config/env.js";

const server = app.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port} in ${config.env} mode`);
  console.log(`🚀 Server running at http://localhost:${config.port}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down server...");
  server.close(() => {
    process.exit(0);
  });
});
