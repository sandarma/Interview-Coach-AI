// ── Mock question bank ─────────────────────────────────────────────────────
// TODO: Replace with Google Sheets MCP retrieval when integration is complete.

interface TopicQuestions {
  [topic: string]: string[];
}

const QUESTION_BANK: TopicQuestions = {
  React: [
    "What is useEffect and when would you use it?",
    "What is the Virtual DOM?",
    "What is the difference between props and state?",
    "What is useMemo?",
    "What is a React Hook?",
    "What is the purpose of useCallback?",
    "How does React handle reconciliation?",
    "What is the Context API and when would you use it?",
    "What is the difference between controlled and uncontrolled components?",
    "What are React Fragments and why would you use them?",
  ],
  JavaScript: [
    "What is a closure and how does it work?",
    "What is the difference between == and ===?",
    "Explain the event loop in JavaScript.",
    "What is hoisting?",
    "What is the difference between var, let, and const?",
  ],
  TypeScript: [
    "What is the difference between an interface and a type alias?",
    "What are generics and when would you use them?",
    "What is type narrowing?",
    "What is the unknown type and how does it differ from any?",
    "What are utility types like Partial and Pick?",
  ],
  APIs: [
    "What is REST and what are its key principles?",
    "What is the difference between GET and POST?",
    "What are HTTP status codes and what do the 4xx and 5xx ranges mean?",
    "What is CORS and why does it exist?",
    "What is the difference between authentication and authorization?",
  ],
  Databases: [
    "What is the difference between SQL and NoSQL databases?",
    "What is database normalization?",
    "What is an index and how does it improve query performance?",
    "What are ACID properties?",
    "What is the difference between INNER JOIN and LEFT JOIN?",
  ],
};

// ── Public API ─────────────────────────────────────────────────────────────

export interface QuestionResponse {
  question: string;
  questionNumber: number;
  totalQuestions: number;
}

export interface QuestionError {
  error: string;
}

export function getQuestion(
  topic: string,
  questionIndex: number,
): QuestionResponse | QuestionError {
  const questions = QUESTION_BANK[topic];

  if (!questions) {
    return {
      error: `Topic "${topic}" not found. Available topics: ${Object.keys(QUESTION_BANK).join(", ")}`,
    };
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
  return Object.keys(QUESTION_BANK);
}
