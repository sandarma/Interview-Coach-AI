import { google } from "googleapis";
import { generateQuestions } from "./claudeService.js";

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
  "\n"
);

const EXCLUDED_TABS = [
  "TypeScript",
  "Databases",
  "Laravel(PHP)",
  "General",
  "Just FYI",
  "Refs",
];

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: CLIENT_EMAIL,
    private_key: PRIVATE_KEY,
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const sheets = google.sheets({ version: "v4", auth });

// ── In-memory caches ───────────────────────────────────────────────────────

const QUESTION_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const TOPIC_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface QuestionCacheEntry {
  questions: string[];
  loadedAt: number;
}

interface TopicCacheEntry {
  topics: string[];
  loadedAt: number;
}

const questionCache: Map<string, QuestionCacheEntry> = new Map();
let topicCache: TopicCacheEntry | null = null;

function isFresh(entry: { loadedAt: number }, ttlMs: number): boolean {
  return Date.now() - entry.loadedAt < ttlMs;
}

// ── Topic reader ───────────────────────────────────────────────────────────

async function fetchSheetTabNames(): Promise<string[]> {
  const res = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID!,
    fields: "sheets.properties.title",
  });

  const tabs =
    res.data.sheets?.map((sheet) => sheet.properties?.title as string) ?? [];

  return tabs.filter((name) => !EXCLUDED_TABS.includes(name));
}

export async function getValidTopics(): Promise<string[]> {
  if (topicCache && isFresh(topicCache, TOPIC_CACHE_TTL_MS)) {
    return topicCache.topics;
  }

  const topics = await fetchSheetTabNames();
  topicCache = { topics, loadedAt: Date.now() };
  return topics;
}

// ── Notes reader ───────────────────────────────────────────────────────────

async function fetchNotesForTopic(topic: string): Promise<string> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID!,
    range: `'${topic}'!B2:B`,
  });

  const rows = res.data.values ?? [];

  const notes = rows
    .map((row) => (row[0] as string | undefined)?.trim())
    .filter((note): note is string => note !== undefined && note.length > 0);

  return notes.join("\n");
}

// ── Question loader ────────────────────────────────────────────────────────

async function loadQuestions(topic: string): Promise<string[]> {
  const cached = questionCache.get(topic);
  if (cached && isFresh(cached, QUESTION_CACHE_TTL_MS)) {
    return cached.questions;
  }

  // Read notes from Google Sheets
  const notes = await fetchNotesForTopic(topic);

  if (!notes || notes.trim().length === 0) {
    throw new Error(`No notes found for topic "${topic}".`);
  }

  // Generate 10 questions dynamically from the notes
  const questions = await generateQuestions(notes);

  questionCache.set(topic, { questions, loadedAt: Date.now() });
  return questions;
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function getQuestion(
  topic: string,
  questionIndex: number
): Promise<QuestionResponse | QuestionError> {
  if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
    return { error: "Google Sheets credentials are not configured." };
  }

  const validTopics = await getValidTopics();

  if (!validTopics.includes(topic)) {
    return {
      error: `Topic "${topic}" not found. Available topics: ${validTopics.join(
        ", "
      )}`,
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
