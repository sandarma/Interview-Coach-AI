import { Router, Request, Response } from "express";
import { evaluateAnswer } from "../services/claudeService.js";
import { getValidTopics } from "../services/questionService.js";

export const evaluateRouter = Router();

interface EvaluateRequestBody {
  topic: string;
  question: string;
  answer: string;
  recaptchaToken?: string;
}

// ── reCAPTCHA Verification ────────────────────────────────────────────────
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
const RECAPTCHA_SCORE_THRESHOLD = 0.5;

async function verifyRecaptcha(token: string): Promise<boolean> {
  // If no secret key configured, skip verification (development mode)
  if (!RECAPTCHA_SECRET_KEY) {
    console.warn("RECAPTCHA_SECRET_KEY not configured, skipping verification");
    return true;
  }

  try {
    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: RECAPTCHA_SECRET_KEY,
        response: token,
      }),
    });

    const data = await response.json();

    // Score: 0.0 = bot, 1.0 = human
    if (data.success && data.score >= RECAPTCHA_SCORE_THRESHOLD) {
      return true;
    }

    console.warn(`reCAPTCHA verification failed: score=${data.score}, success=${data.success}`);
    return false;
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    // On error, allow the request (fail open for UX)
    return true;
  }
}

evaluateRouter.post("/evaluate", async (req: Request, res: Response) => {
  try {
    const { topic, question, answer, recaptchaToken } = req.body as EvaluateRequestBody;

    // ── reCAPTCHA Validation ─────────────────────────────────────────────
    if (recaptchaToken) {
      const isValid = await verifyRecaptcha(recaptchaToken);
      if (!isValid) {
        res.status(403).json({
          error: "Security verification failed. Please try again.",
        });
        return;
      }
    }

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
