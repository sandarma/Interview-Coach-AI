import { useState, useEffect } from "react";
import { getTopics } from "../services/topicApi";

interface WelcomeScreenProps {
  onSelectTopic: (topic: string) => void;
}

const WelcomeScreen = ({ onSelectTopic }: WelcomeScreenProps) => {
  const [topics, setTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const data = await getTopics();
        setTopics(data);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load topics. Please try again.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadTopics();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:py-24">
        {/* Header */}
        <div className="text-center">
          <span className="text-5xl">🧠</span>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Interview Coach AI
          </h1>
          <p className="mt-4 text-base leading-relaxed text-gray-500">
            Practice technical interview questions and receive AI-powered
            feedback.
          </p>
        </div>

        {/* Topic cards */}
        <div className="mt-12">
          <p className="mb-5 text-center text-sm font-medium uppercase tracking-wide text-gray-400">
            Choose a topic
          </p>

          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
              <p className="mt-4 text-sm text-gray-500">Loading topics…</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="flex flex-col items-center py-12">
              <span className="text-3xl">⚠️</span>
              <p className="mt-4 max-w-md text-center text-sm text-gray-500">
                {error}
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-6 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Topic grid */}
          {!isLoading && !error && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {topics.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => onSelectTopic(topic)}
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-6 shadow-sm transition hover:border-blue-300 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100"
                >
                  <span className="text-3xl">📝</span>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600">
                    {topic}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
