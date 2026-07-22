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

interface EvaluateRequest {
  topic: string;
  question: string;
  answer: string;
  recaptchaToken?: string | null;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  throw new Error(
    "VITE_API_URL is not set. Configure it in your .env file or Vercel environment variables.",
  );
}

export async function evaluateAnswer(
  topic: string,
  question: string,
  answer: string,
  recaptchaToken?: string | null,
): Promise<EvaluationResult> {
  const body: EvaluateRequest = { topic, question, answer };
  if (recaptchaToken) {
    body.recaptchaToken = recaptchaToken;
  }

  const response = await fetch(`${API_BASE_URL}/api/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message =
      (data as { error?: string }).error ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  const data: unknown = await response.json();
  return data as EvaluationResult;
}
