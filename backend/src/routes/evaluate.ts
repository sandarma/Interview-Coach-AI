import { Router, Request, Response } from "express";
import { evaluateAnswer } from "../services/claudeService.js";
import { getValidTopics } from "../services/questionService.js";

export const evaluateRouter = Router();

interface EvaluateRequestBody {
  topic: string;
  question: string;
  answer: string;
}

evaluateRouter.post("/evaluate", async (req: Request, res: Response) => {
  try {
    const { topic, question, answer } = req.body as EvaluateRequestBody;

    // ── Input Validation ──────────────────────────────────────────────────
    // Type checks
    if (typeof topic !== "string" || typeof question !== "string" || typeof answer !== "string") {
      res.status(400).json({
        error: "Invalid input: topic, question, and answer must be strings.",
      });
      return;
    }

    // Required field checks
    if (!topic.trim() || !question.trim() || !answer.trim()) {
      res.status(400).json({
        error: "Missing required fields: topic, question, and answer are required.",
      });
      return;
    }

    // Length checks
    if (topic.length > 100) {
      res.status(400).json({
        error: "Topic is too long. Maximum 100 characters allowed.",
      });
      return;
    }

    if (question.length > 1000) {
      res.status(400).json({
        error: "Question is too long. Maximum 1000 characters allowed.",
      });
      return;
    }

    if (answer.length > 1000) {
      res.status(400).json({
        error: "Answer is too long. Maximum 1000 characters allowed.",
      });
      return;
    }

    // Topic validation
    const validTopics = await getValidTopics();

    if (!validTopics.includes(topic)) {
      res.status(400).json({
        error: "Invalid topic. Please select a valid topic.",
      });
      return;
    }

    // ── Security: Don't accept client-supplied notes ─────────────────────
    // Notes should be fetched server-side from Google Sheets, not sent by client
    const evaluation = await evaluateAnswer(question, answer);

    res.json(evaluation);
  } catch (error) {
    // Log detailed error server-side only
    console.error("Evaluation error:", error);

    // Return generic error to client (don't expose internal details)
    res.status(500).json({
      error: "Failed to evaluate the answer. Please try again.",
    });
  }
});
