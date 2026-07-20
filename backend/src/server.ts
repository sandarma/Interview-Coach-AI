import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { evaluateRouter } from "./routes/evaluate.js";
import { questionRouter } from "./routes/question.js";

dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 3001;

// ── CORS Configuration ─────────────────────────────────────────────────────
// Restrict CORS to deployed frontend origin in production
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

// ── Body Parser with Size Limit ────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));

// ── Rate Limiters ──────────────────────────────────────────────────────────
// Global rate limiter: 100 requests per hour per IP
const globalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: { error: "Rate limit exceeded. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", globalLimiter);

// Stricter rate limiter for evaluations: 10 per hour per IP (production only)
if (process.env.NODE_ENV === "production") {
  const evaluateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: { error: "Rate limit exceeded. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api/evaluate", evaluateLimiter);

  // Rate limiter for questions: 30 per hour per IP
  const questionLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 30,
    message: { error: "Rate limit exceeded. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api/question", questionLimiter);

  // Rate limiter for topics: 20 per hour per IP
  const topicsLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    message: { error: "Rate limit exceeded. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api/topics", topicsLimiter);
}

// Routes
app.use("/api", evaluateRouter);
app.use("/api", questionRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Interview Coach API running on http://localhost:${PORT}`);
});

export default app;
