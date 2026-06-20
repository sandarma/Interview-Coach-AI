import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

dotenv.config({ override: true });

// ── Types ──────────────────────────────────────────────────────────────────

export interface EvaluationResult {
  overallScore: number;
  technicalAccuracy: number;
  completeness: number;
  communication: number;
  strengths: string[];
  missingConcepts: string[];
  coachingFeedback: string;
  improvedAnswer: string;
  followUpQuestion: string;
}

/** Shape that Claude returns — `feedback` is renamed to `coachingFeedback` after validation. */
interface RawClaudeResponse {
  overallScore: number;
  technicalAccuracy: number;
  completeness: number;
  communication: number;
  strengths: string[];
  missingConcepts: string[];
  feedback: string;
  improvedAnswer: string;
  followUpQuestion: string;
}

// ── Constants ──────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SKILL_PATH = join(
  __dirname,
  "..",
  "..",
  "..",
  ".claude",
  "skills",
  "evaluate-answer",
  "SKILL.md",
);

const SYSTEM_PROMPT = loadSkillFile();
const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";

// ── Helpers ────────────────────────────────────────────────────────────────

function loadSkillFile(): string {
  try {
    return readFileSync(SKILL_PATH, "utf-8");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Failed to load evaluation skill file from ${SKILL_PATH}: ${message}`,
    );
  }
}

function buildUserMessage(
  question: string,
  answer: string,
  notes?: string,
): string {
  const parts = ["## Question", question, "", "## User Answer", answer];

  if (notes && notes.trim().length > 0) {
    parts.push("", "## Retrieved Notes", notes);
  }

  return parts.join("\n");
}

function getApiKey(): string {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;

  if (!apiKey || apiKey === "your-api-key-here") {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add your Anthropic API key to backend/.env.",
    );
  }

  return apiKey;
}

// ── Schema validation ─────────────────────────────────────────────────────

const REQUIRED_STRING_FIELDS: (keyof RawClaudeResponse)[] = [
  "feedback",
  "improvedAnswer",
  "followUpQuestion",
];

const REQUIRED_NUMBER_FIELDS: (keyof RawClaudeResponse)[] = [
  "overallScore",
  "technicalAccuracy",
  "completeness",
  "communication",
];

const REQUIRED_ARRAY_FIELDS: (keyof RawClaudeResponse)[] = [
  "strengths",
  "missingConcepts",
];

function validateResponse(raw: unknown): RawClaudeResponse {
  if (!raw || typeof raw !== "object") {
    throw new Error("Claude returned an empty or non-object response.");
  }

  const obj = raw as Record<string, unknown>;

  for (const field of REQUIRED_STRING_FIELDS) {
    if (typeof obj[field] !== "string") {
      throw new Error(
        `Missing or invalid field in Claude response: "${field}" must be a string.`,
      );
    }
  }

  for (const field of REQUIRED_NUMBER_FIELDS) {
    if (typeof obj[field] !== "number") {
      throw new Error(
        `Missing or invalid field in Claude response: "${field}" must be a number.`,
      );
    }
  }

  for (const field of REQUIRED_ARRAY_FIELDS) {
    if (!Array.isArray(obj[field])) {
      throw new Error(
        `Missing or invalid field in Claude response: "${field}" must be an array.`,
      );
    }
    for (const item of obj[field] as unknown[]) {
      if (typeof item !== "string") {
        throw new Error(
          `Invalid item in "${field}": every entry must be a string.`,
        );
      }
    }
  }

  return obj as unknown as RawClaudeResponse;
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function evaluateAnswer(
  question: string,
  answer: string,
  notes?: string,
): Promise<EvaluationResult> {
  const apiKey = getApiKey();

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2048,
      temperature: 0.4,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildUserMessage(question, answer, notes),
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Claude API error (${response.status}): ${body || response.statusText}`,
    );
  }

  const message = (await response.json()) as {
    content: { type: string; text: string }[];
  };

  const textBlocks = message.content.filter(
    (block) => block.type === "text",
  );

  if (textBlocks.length === 0) {
    throw new Error("Claude returned no text content in the response.");
  }

  const rawResponse = textBlocks.map((b) => b.text).join("");

  // Parse the JSON from Claude's response
  let parsed: unknown;
  try {
    const cleaned = rawResponse
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(
      "Claude returned a response that could not be parsed as JSON. The model may have returned unexpected output.",
    );
  }

  // Validate the response shape
  const validated = validateResponse(parsed);

  // Map to frontend-compatible field names
  return {
    overallScore: validated.overallScore,
    technicalAccuracy: validated.technicalAccuracy,
    completeness: validated.completeness,
    communication: validated.communication,
    strengths: validated.strengths,
    missingConcepts: validated.missingConcepts,
    coachingFeedback: validated.feedback,
    improvedAnswer: validated.improvedAnswer,
    followUpQuestion: validated.followUpQuestion,
  };
}
