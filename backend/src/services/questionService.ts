import { google } from "googleapis";

// ── Types ──────────────────────────────────────────────────────────────────

export interface QuestionResponse {
  question: string;
  questionNumber: number;
  totalQuestions: number;
}

export interface QuestionError {
  error: string;
}

// ── Google Sheets client ───────────────────────────────────────────────────

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const CLIENT_EMAIL = process.env.CLIENT_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = (process.env.CLIENT_SERVICE_ACCOUNT_KEY || "").replace(
  /\\n/g,
  "\n",
);

const TOPICS = ["React", "JavaScript", "TypeScript", "APIs", "Databases"];

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: CLIENT_EMAIL,
    private_key: PRIVATE_KEY,
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const sheets = google.sheets({ version: "v4", auth });

// ── In-memory cache ───────────────────────────────────────────────────────

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface CacheEntry {
  questions: string[];
  loadedAt: number;
}

const cache: Map<string, CacheEntry> = new Map();

function isFresh(entry: CacheEntry): boolean {
  return Date.now() - entry.loadedAt < CACHE_TTL_MS;
}

// ── Sheet reader ───────────────────────────────────────────────────────────

async function fetchQuestionsForTopic(topic: string): Promise<string[]> {
  // Read column B (Question) from row 2 onward, skipping the header
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID!,
    range: `'${topic}'!B2:B`,
  });

  const rows = res.data.values ?? [];

  // Flatten, trim, and filter out empty rows
  return rows
    .map((row) => (row[0] as string | undefined)?.trim())
    .filter((q): q is string => q !== undefined && q.length > 0);
}

async function loadQuestions(topic: string): Promise<string[]> {
  const cached = cache.get(topic);
  if (cached && isFresh(cached)) {
    return cached.questions;
  }

  const questions = await fetchQuestionsForTopic(topic);
  cache.set(topic, { questions, loadedAt: Date.now() });
  return questions;
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function getQuestion(
  topic: string,
  questionIndex: number,
): Promise<QuestionResponse | QuestionError> {
  if (!TOPICS.includes(topic)) {
    return {
      error: `Topic "${topic}" not found. Available topics: ${TOPICS.join(", ")}`,
    };
  }

  if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
    return {
      error: "Google Sheets credentials are not configured.",
    };
  }

  let questions: string[];
  try {
    questions = await loadQuestions(topic);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: `Failed to load questions for "${topic}": ${message}` };
  }

  if (questions.length === 0) {
    return { error: `No questions found for topic "${topic}".` };
  }

  if (questionIndex < 0 || questionIndex >= questions.length) {
    return {
      error: `Question index ${questionIndex} is out of range. This topic has ${questions.length} questions.`,
    };
  }

  return {
    question: questions[questionIndex],
    questionNumber: questionIndex + 1,
    totalQuestions: questions.length,
  };
}

export function getTopics(): string[] {
  return TOPICS;
}
