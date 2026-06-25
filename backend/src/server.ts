import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { evaluateRouter } from "./routes/evaluate.js";
import { questionRouter } from "./routes/question.js";

dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiter for evaluations: 10 per hour per IP (production only)
if (process.env.NODE_ENV === "production") {
  const evaluateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: { error: "Rate limit exceeded. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api/evaluate", evaluateLimiter);
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
