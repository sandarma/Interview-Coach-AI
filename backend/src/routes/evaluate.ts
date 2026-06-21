import { Router, Request, Response } from "express";
import { evaluateAnswer } from "../services/claudeService.js";

export const evaluateRouter = Router();

interface EvaluateRequestBody {
  topic: string;
  question: string;
  answer: string;
  notes?: string;
}

evaluateRouter.post("/evaluate", async (req: Request, res: Response) => {
  try {
    const { topic, question, answer, notes } = req.body as EvaluateRequestBody;

    if (!topic || !question || !answer) {
      res.status(400).json({
        error:
          "Missing required fields: topic, question, and answer are required.",
      });
      return;
    }

    const evaluation = await evaluateAnswer(question, answer, notes);

    res.json(evaluation);
  } catch (error) {
    console.error("Evaluation error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to evaluate the answer. Please try again.";

    res.status(500).json({ error: message });
  }
});
