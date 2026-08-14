import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import { clerkAuth } from "./middleware/auth.js";
import errorHandler from "./middleware/errorHandler.js";
import videoRoutes from "./routes/videoRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from root .env
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Global Middleware ──────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // Increased to allow status polling
  message: { success: false, message: "Too many requests. Please try again later." },
});
app.use("/api/", apiLimiter);

// Clerk authentication middleware (initializes on all routes)
app.use(clerkAuth);

// ─── Routes ─────────────────────────────────────────────────────────
app.use("/api/videos", videoRoutes);
app.use("/api/videos", chatRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "express-server",
    timestamp: new Date().toISOString(),
  });
});

// ─── Error Handling ─────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────────────────
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`\n🚀 Express server running on port ${PORT}`);
    console.log(`   API: http://localhost:${PORT}/api`);
    console.log(`   ML Service: ${process.env.ML_SERVICE_URL || "http://localhost:8000"}`);
    console.log(`   Environment: ${process.env.NODE_ENV || "development"}\n`);
  });
};

startServer();
