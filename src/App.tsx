import { useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import WelcomeScreen from './components/WelcomeScreen'
import PracticeSession from './components/PracticeSession'

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || ''

function App() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)

  // Wrap with reCAPTCHA provider if site key is configured
  const content = (
    <>
      { !selectedTopic ? (
        <>
          <WelcomeScreen onSelectTopic={setSelectedTopic} />
          <Analytics />
        </>
      ) : (
        <>
          <PracticeSession
            topic={selectedTopic}
            onBackToWelcome={() => setSelectedTopic(null)}
          />
          <Analytics />
        </>
      )}
    </>
  )

  if (RECAPTCHA_SITE_KEY) {
    return (
      <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY}>
        {content}
      </GoogleReCaptchaProvider>
    )
  }

  return content
}

export default App
