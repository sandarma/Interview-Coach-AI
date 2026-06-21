import { useState } from 'react'
import WelcomeScreen from './components/WelcomeScreen'
import PracticeSession from './components/PracticeSession'

function App() {
  const [selectedTopic, setSelectedTopic] = useState(null)

  if (!selectedTopic) {
    return <WelcomeScreen onSelectTopic={setSelectedTopic} />
  }

  return (
    <PracticeSession
      topic={selectedTopic}
      onBackToWelcome={() => setSelectedTopic(null)}
    />
  )
}

export default App
