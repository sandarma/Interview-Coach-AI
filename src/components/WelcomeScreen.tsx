const TOPICS = [
  { name: "React", emoji: "⚛️" },
  { name: "JavaScript", emoji: "🟨" },
  { name: "TypeScript", emoji: "🔷" },
  { name: "APIs", emoji: "🌐" },
  { name: "Databases", emoji: "🗄️" },
  { name: "AI", emoji: "🤖" },
  { name: "Laravel (PHP)", emoji: "🔺" },
];

interface WelcomeScreenProps {
  onSelectTopic: (topic: string) => void;
}

const WelcomeScreen = ({ onSelectTopic }: WelcomeScreenProps) => (
  <div className="min-h-screen bg-gray-50">
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:py-24">
      {/* Header */}
      <div className="text-center">
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {TOPICS.map((topic) => (
            <button
              key={topic.name}
              type="button"
              onClick={() => onSelectTopic(topic.name)}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-6 shadow-sm transition hover:border-blue-300 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              <span className="text-3xl">{topic.emoji}</span>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600">
                {topic.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default WelcomeScreen;
