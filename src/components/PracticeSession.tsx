import { useState } from "react";
import { evaluateAnswer, type EvaluationResult } from "../services/api";

// ── Question bank ──────────────────────────────────────────────────────────

const QUESTIONS = [
  "What is useEffect and when would you use it?",
  "What is the Virtual DOM?",
  "What is the difference between props and state?",
  "What is useMemo?",
  "What is a React Hook?",
];

const TOPIC = "React";

type Phase = "answering" | "loading" | "evaluating" | "error" | "complete";

// ── Shared score helpers ───────────────────────────────────────────────────

const scoreColor = (score: number) =>
  score >= 80
    ? "text-emerald-600"
    : score >= 65
      ? "text-amber-600"
      : "text-red-500";

const scoreBg = (score: number) =>
  score >= 80
    ? "bg-emerald-50 ring-emerald-200"
    : score >= 65
      ? "bg-amber-50 ring-amber-200"
      : "bg-red-50 ring-red-200";

// ── Reusable header bar ────────────────────────────────────────────────────

const HeaderBar = ({
  questionNumber,
  totalQuestions,
}: {
  questionNumber: number;
  totalQuestions: number;
}) => (
  <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
    <div className="flex items-center gap-3">
      <span className="text-lg">🧠</span>
      <span className="text-sm font-medium text-gray-500">Interview Coach</span>
    </div>
    <div className="flex items-center gap-3">
      <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600 ring-1 ring-inset ring-blue-200">
        {TOPIC}
      </span>
      <span className="text-xs text-gray-400">
        Question {questionNumber} of {totalQuestions}
      </span>
    </div>
  </div>
);

// ── Card wrapper ───────────────────────────────────────────────────────────

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gray-50">
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="overflow-hidden rounded-2xl bg-white shadow-md">
        {children}
      </div>
    </div>
  </div>
);

// ── Component ──────────────────────────────────────────────────────────────

const PracticeSession = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [phase, setPhase] = useState<Phase>("answering");
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const totalQuestions = QUESTIONS.length;
  const questionNumber = currentQuestionIndex + 1;

  const handleSubmit = async () => {
    if (answer.trim().length === 0) return;

    setPhase("loading");
    setErrorMessage("");

    try {
      const result = await evaluateAnswer(TOPIC, currentQuestion, answer);
      setEvaluation(result);
      setPhase("evaluating");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMessage(message);
      setPhase("error");
    }
  };

  const handleImproveAnswer = () => {
    setAnswer("");
    setEvaluation(null);
    setPhase("answering");
  };

  const handleContinue = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex >= QUESTIONS.length) {
      setPhase("complete");
    } else {
      setCurrentQuestionIndex(nextIndex);
      setAnswer("");
      setEvaluation(null);
      setPhase("answering");
    }
  };

  const handleStartAgain = () => {
    setCurrentQuestionIndex(0);
    setAnswer("");
    setEvaluation(null);
    setErrorMessage("");
    setPhase("answering");
  };

  const handleBackToAnswer = () => {
    setErrorMessage("");
    setPhase("answering");
  };

  // ── Answering phase ─────────────────────────────────────────────────────

  if (phase === "answering") {
    return (
      <Card>
        <HeaderBar questionNumber={questionNumber} totalQuestions={totalQuestions} />

        <div className="px-6 py-8 sm:px-8 lg:px-10">
          <h1 className="text-2xl font-bold leading-relaxed text-gray-900">
            {currentQuestion}
          </h1>

          <div className="mt-8">
            <label
              htmlFor="answer"
              className="mb-2 block text-sm font-medium text-gray-600"
            >
              Your Answer
            </label>
            <textarea
              id="answer"
              rows={10}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your explanation here…"
              className="w-full min-h-40 resize-y rounded-lg border border-gray-300 px-4 py-3 text-base leading-relaxed text-gray-800 placeholder-gray-400 transition focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="mt-6 flex flex-col gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-gray-400">
              {answer.length > 0
                ? `${answer.length} characters`
                : "Be thorough — aim for a few sentences"}
            </span>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={answer.trim().length === 0}
              className="w-full rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              Submit Answer
            </button>
          </div>
        </div>
      </Card>
    );
  }

  // ── Loading phase ────────────────────────────────────────────────────────

  if (phase === "loading") {
    return (
      <Card>
        <HeaderBar questionNumber={questionNumber} totalQuestions={totalQuestions} />

        <div className="flex flex-col items-center px-6 py-20 sm:px-8 lg:px-10">
          <div className="flex items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          </div>
          <p className="mt-6 text-base font-medium text-gray-600">
            Evaluating your answer…
          </p>
          <p className="mt-2 text-sm text-gray-400">
            The coach is reviewing your response
          </p>
        </div>
      </Card>
    );
  }

  // ── Error phase ──────────────────────────────────────────────────────────

  if (phase === "error") {
    return (
      <Card>
        <HeaderBar questionNumber={questionNumber} totalQuestions={totalQuestions} />

        <div className="flex flex-col items-center px-6 py-20 sm:px-8 lg:px-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-7 w-7 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="mt-5 text-lg font-semibold text-gray-900">
            Evaluation Failed
          </h2>
          <p className="mt-2 max-w-md text-center text-sm leading-relaxed text-gray-500">
            {errorMessage}
          </p>
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={handleBackToAnswer}
              className="rounded-lg border border-gray-300 bg-white px-8 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200"
            >
              Edit Answer
            </button>
          </div>
        </div>
      </Card>
    );
  }

  // ── Complete phase ───────────────────────────────────────────────────────

  if (phase === "complete") {
    return (
      <Card>
        <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-3">
            <span className="text-lg">🧠</span>
            <span className="text-sm font-medium text-gray-500">
              Interview Coach
            </span>
          </div>
          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600 ring-1 ring-inset ring-blue-200">
            {TOPIC}
          </span>
        </div>

        <div className="px-6 py-16 text-center sm:px-8 lg:px-10">
          <p className="text-5xl">🎉</p>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Interview Complete
          </h1>
          <p className="mt-3 text-base leading-relaxed text-gray-500">
            You've answered all {totalQuestions} questions. Great work practicing
            your technical communication skills.
          </p>
          <div className="mt-10">
            <button
              type="button"
              onClick={handleStartAgain}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
            >
              Start Again
            </button>
          </div>
        </div>
      </Card>
    );
  }

  // ── Evaluation phase ─────────────────────────────────────────────────────

  const e = evaluation!;
  const isLastQuestion = currentQuestionIndex === QUESTIONS.length - 1;

  return (
    <Card>
      <HeaderBar questionNumber={questionNumber} totalQuestions={totalQuestions} />

      <div className="px-6 py-8 sm:px-8 lg:px-10">
        {/* Question — de-emphasized */}
        <div className="mb-10">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
            Evaluation Report
          </p>
          <p className="text-base leading-relaxed text-gray-500">
            {currentQuestion}
          </p>
        </div>

        {/* Score cards — 4-column responsive grid */}
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div
            className={`rounded-xl px-5 py-6 ring-1 ring-inset ${scoreBg(e.overallScore)}`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Overall
            </p>
            <p className={`mt-1 text-3xl font-bold ${scoreColor(e.overallScore)}`}>
              {e.overallScore}%
            </p>
          </div>
          <div className="rounded-xl bg-gray-50/80 px-5 py-6 ring-1 ring-inset ring-gray-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Accuracy
            </p>
            <p className={`mt-1 text-3xl font-bold ${scoreColor(e.technicalAccuracy)}`}>
              {e.technicalAccuracy}%
            </p>
          </div>
          <div className="rounded-xl bg-gray-50/80 px-5 py-6 ring-1 ring-inset ring-gray-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Complete
            </p>
            <p className={`mt-1 text-3xl font-bold ${scoreColor(e.completeness)}`}>
              {e.completeness}%
            </p>
          </div>
          <div className="rounded-xl bg-gray-50/80 px-5 py-6 ring-1 ring-inset ring-gray-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Communication
            </p>
            <p className={`mt-1 text-3xl font-bold ${scoreColor(e.communication)}`}>
              {e.communication}%
            </p>
          </div>
        </div>

        {/* Strengths & Missing Concepts */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border-l-4 border-emerald-500 bg-emerald-50/30 px-6 py-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Strengths
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-700 marker:text-emerald-400">
              {e.strengths.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border-l-4 border-rose-500 bg-rose-50/30 px-6 py-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-rose-700">
              Missing Concepts
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-700 marker:text-rose-400">
              {e.missingConcepts.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Coaching Feedback */}
        <div className="mb-6 rounded-xl border-l-4 border-indigo-500 bg-indigo-50/30 px-6 py-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo-700">
            Coaching Feedback
          </h2>
          <p className="text-sm leading-relaxed text-gray-700">
            {e.coachingFeedback}
          </p>
        </div>

        {/* Improved Answer */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50/60 px-6 py-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600">
            Improved Answer
          </h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
            {e.improvedAnswer}
          </p>
        </div>

        {/* Follow-up Question */}
        <div className="mb-10 rounded-xl border-l-4 border-violet-500 bg-violet-50/30 px-6 py-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-violet-700">
            Follow-up Question
          </h2>
          <p className="text-sm font-medium leading-relaxed text-gray-800">
            {e.followUpQuestion}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row">
          <button
            type="button"
            onClick={handleImproveAnswer}
            className="w-full rounded-lg border border-gray-300 bg-white px-8 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 sm:w-auto"
          >
            Improve My Answer
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="w-full rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 sm:w-auto sm:ml-auto"
          >
            {isLastQuestion ? "Finish Interview" : "Continue Interview"}
          </button>
        </div>
      </div>
    </Card>
  );
};

export default PracticeSession;
