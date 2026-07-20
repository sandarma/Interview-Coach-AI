import { Router, Request, Response } from "express";
import { getQuestion, getValidTopics } from "../services/questionService.js";

export const questionRouter = Router();

interface QuestionRequestBody {
  topic: string;
  questionIndex?: number;
}

questionRouter.post("/question", async (req: Request, res: Response) => {
  try {
    const { topic, questionIndex = 0 } = req.body as QuestionRequestBody;

    // ── Input Validation ──────────────────────────────────────────────────
    // Type checks
    if (typeof topic !== "string") {
      res.status(400).json({
        error: "Invalid input: topic must be a string.",
      });
      return;
    }

    // Required field check
    if (!topic.trim()) {
      res.status(400).json({
        error: "Missing required field: topic is required.",
      });
      return;
    }

    // Length check
    if (topic.length > 100) {
      res.status(400).json({
        error: "Topic is too long. Maximum 100 characters allowed.",
      });
      return;
    }

    // questionIndex validation
    if (typeof questionIndex !== "number" || !Number.isInteger(questionIndex) || questionIndex < 0) {
      res.status(400).json({
        error: "Invalid questionIndex: must be a non-negative integer.",
      });
      return;
    }

    if (questionIndex > 100) {
      res.status(400).json({
        error: "questionIndex is too large.",
      });
      return;
    }

    const result = await getQuestion(topic, questionIndex);

    if ("error" in result) {
      res.status(400).json(result);
      return;
    }

    res.json(result);
  } catch (error) {
    // Log detailed error server-side only
    console.error("Question error:", error);

    // Return generic error to client (don't expose internal details)
    res.status(500).json({
      error: "Failed to retrieve question. Please try again.",
    });
  }
});

// GET /api/topics — list all available topics from Google Sheets tabs
questionRouter.get("/topics", async (_req: Request, res: Response) => {
  try {
    const topics = await getValidTopics();
    res.json(topics);
  } catch (error) {
    // Log detailed error server-side only
    console.error("Topics error:", error);

    // Return generic error to client (don't expose internal details)
    res.status(500).json({
      error: "Failed to retrieve topics. Please try again.",
    });
  }
});
