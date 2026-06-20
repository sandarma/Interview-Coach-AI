export interface QuestionResult {
  question: string;
  questionNumber: number;
  totalQuestions: number;
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001";

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
