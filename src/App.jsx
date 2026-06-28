import { useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import WelcomeScreen from './components/WelcomeScreen'
import PracticeSession from './components/PracticeSession'

function App() {
  const [selectedTopic, setSelectedTopic] = useState(null)

  if (!selectedTopic) {
    return (
      <>
        <WelcomeScreen onSelectTopic={setSelectedTopic} />
        <Analytics />
      </>
    )
  }

  return (
    <>
      <PracticeSession
        topic={selectedTopic}
        onBackToWelcome={() => setSelectedTopic(null)}
      />
      <Analytics />
    </>
  )
}

export default App
