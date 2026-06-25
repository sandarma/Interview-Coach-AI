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

    if (!topic) {
      res.status(400).json({
        error: "Missing required field: topic is required.",
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
    console.error("Question error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to retrieve question.";
    res.status(500).json({ error: message });
  }
});

// GET /api/topics — list all available topics from Google Sheets tabs
questionRouter.get("/topics", async (_req: Request, res: Response) => {
  try {
    const topics = await getValidTopics();
    res.json(topics);
  } catch (error) {
    console.error("Topics error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to retrieve topics.";
    res.status(500).json({ error: message });
  }
});
