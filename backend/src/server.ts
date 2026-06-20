import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { evaluateRouter } from "./routes/evaluate.js";
import { questionRouter } from "./routes/question.js";

dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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
