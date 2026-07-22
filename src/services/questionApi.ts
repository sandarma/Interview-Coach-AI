export interface QuestionResult {
  question: string;
  questionNumber: number;
  totalQuestions: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  throw new Error(
    "VITE_API_URL is not set. Configure it in your .env file or Vercel environment variables.",
  );
}

export async function fetchQuestion(
  topic: string,
  questionIndex: number,
): Promise<QuestionResult> {
  const response = await fetch(`${API_BASE_URL}/api/question`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, questionIndex }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message =
      (data as { error?: string }).error ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  const data: unknown = await response.json();
  return data as QuestionResult;
}
