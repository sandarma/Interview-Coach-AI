# Interview Coach AI — Project Report

**Date:** June 2026  
**Author:** Sandar Min Aye

---

## 1. Introduction

Technical interviews are a critical gate in the software engineering hiring process, yet many developers struggle to perform well in them — not because they lack knowledge, but because they have not practised explaining technical concepts aloud in a realistic interview setting. Traditional preparation methods such as reading documentation, watching tutorials, or completing coding challenges do not adequately train the communication skills that interviewers assess.

Interview Coach AI addresses this gap by providing an AI-powered practice environment where developers can answer technical interview questions, receive structured feedback, and iteratively improve their explanations. The system is designed around a coaching philosophy that prioritises understanding over memorisation, clear communication over keyword matching, and supportive guidance over judgmental scoring.

This report documents the design, implementation, and evaluation of Interview Coach AI, covering the system architecture, the skill design, the integration of Google Sheets as a knowledge source, and the Retrieval-Augmented Generation (RAG) methodology that underpins the question-generation and answer-evaluation workflow.

---

## 2. Problem Statement

Technical interviews in the software industry typically consist of two components: coding exercises and conceptual discussions. While platforms such as LeetCode and HackerRank provide extensive practice for the coding component, there are few tools that help developers practise the verbal and written explanation of technical concepts.

Candidates often face the following challenges:

1. **Lack of realistic practice.** Reading documentation or watching videos is a passive activity that does not simulate the pressure and expectations of a live interview.
2. **No actionable feedback.** When practising alone, candidates receive no evaluation of whether their explanations are accurate, complete, or clearly communicated.
3. **Memorisation trap.** Candidates may memorise textbook definitions without developing genuine understanding, which interviewers can detect through follow-up questions.
4. **Knowledge gaps are invisible.** Without structured feedback, candidates do not know which concepts they have missed or misunderstood.

Existing solutions in the market fall short. General-purpose AI chatbots can answer technical questions but are not designed to evaluate answers, provide structured coaching, or guide a practice session. There is a clear need for a specialised coaching tool that combines domain-specific knowledge, structured evaluation, and an interview-simulating user experience.

---

## 3. Project Goal

The goal of Interview Coach AI is to build an intelligent coaching application that helps developers improve their technical interview performance through interactive practice sessions.

The system aims to:

- Simulate a supportive technical interviewer who asks questions, listens to answers, and provides constructive feedback.
- Evaluate user answers across three dimensions: technical accuracy, completeness, and communication clarity.
- Identify missing concepts and knowledge gaps in the user's response.
- Provide an improved model answer that demonstrates interview-ready communication.
- Generate follow-up questions that test deeper understanding.
- Use a RAG methodology to ground questions and evaluations in domain-specific knowledge retrieved from a structured knowledge base.
- Operate as a MVP with a simple, maintainable architecture that can be extended in future iterations.

The application supports interview practice in topics defined by Google Sheets tabs. The current sheet includes React, JavaScript, TypeScript, APIs, Databases, AI, and Laravel (PHP), but new topics can be added simply by creating a new tab.

---

## 4. Methodology

### 4.1 Retrieval-Augmented Generation (RAG)

Interview Coach AI is built on a Retrieval-Augmented Generation (RAG) methodology. The core idea of RAG is to augment a large language model (LLM) with domain-specific knowledge that is retrieved from an external source at query time, rather than relying solely on the model's parametric knowledge.

In this project, the RAG pipeline consists of four stages:

1. **Knowledge Storage.** Technical interview notes, concept explanations, and example answers are stored in Google Sheets. The sheet is structured with topics (React, JavaScript, APIs, AI, Laravel) as separate tabs, with study notes in column B of each tab.

2. **Knowledge Retrieval.** When a user selects a topic or submits an answer, the backend retrieves relevant notes from Google Sheets via the `googleapis` npm package. The retrieval is topic-scoped — when practising React questions, only React-related notes are fetched.

3. **Context Augmentation.** The retrieved notes are combined with the question and the user's answer into a structured prompt that is sent to Claude. The notes serve as reference knowledge against which the answer is evaluated.

4. **Structured Generation.** Claude generates a structured evaluation in JSON format, containing scores, strengths, missing concepts, coaching feedback, an improved answer, and a follow-up question.

This approach ensures that evaluations are grounded in curated technical content rather than the model's potentially outdated or inaccurate parametric knowledge alone.

### 4.2 Coaching Philosophy

The system is designed around a coaching methodology that differs from traditional exam-grading approaches:

- **Understanding over memorisation.** The evaluator rewards conceptual understanding rather than verbatim recall of definitions. A student who can explain a concept in their own words scores higher than one who recites a textbook definition without demonstrating comprehension.
- **Scoring with context.** Each score is accompanied by qualitative feedback — strengths, missing concepts, and an improved answer — so the user learns what to work on, not just how they were rated.
- **Iterative improvement.** The "Improve My Answer" feature allows users to retry the same question after reviewing feedback, supporting deliberate practice with rapid feedback loops.
- **Difficulty progression.** Questions are dynamically generated by Claude with a mix of easy, medium, and hard difficulty levels, simulating a natural interview progression.

### 4.3 Technology Stack

| Layer            | Technology                           | Rationale                                                                          |
| ---------------- | ------------------------------------ | ---------------------------------------------------------------------------------- |
| Frontend         | React 19, TypeScript, Tailwind CSS 4 | Component-based UI with type safety and utility-first styling                      |
| Backend          | Node.js, Express 5, TypeScript       | Lightweight REST API, shared TypeScript types with frontend                        |
| AI               | Anthropic Claude API (Sonnet 4.6)    | Question generation and answer evaluation via system prompts and structured output |
| Knowledge Source | Google Sheets via `googleapis`       | Accessible, collaborative, no database setup required for MVP                      |
| Build Tools      | Vite 8 (frontend), tsx (backend)     | Fast dev server with HMR, TypeScript execution without compilation                 |

---

## 5. System Architecture

### 5.1 High-Level Architecture

Interview Coach AI follows a client-server architecture with a clear separation of concerns between the presentation layer, the API layer, the AI service layer, and the knowledge layer.

```
┌─────────────────┐
│ React Frontend  │
│ (Vite + TS)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Express Backend │
│ (TypeScript)    │
└────────┬────────┘
         │
         ├────────────────────┐
         ▼                    ▼
┌─────────────────┐   ┌─────────────────┐
│ Claude API      │   │ Google Sheets   │
│ (Sonnet 4.6)    │   │ (googleapis)    │
│                 │   │                 │
│ • Question Gen  │   │ • Notes         │
│ • Evaluation    │   │ • Topics        │
└─────────────────┘   └─────────────────┘
```

The backend exposes three main endpoints:

- `POST /api/question` — retrieves notes from Google Sheets, generates 10 questions via Claude
- `POST /api/evaluate` — evaluates a user answer against retrieved notes using Claude
- `GET /api/topics` — lists available topics from Google Sheets tab names

```

### 5.2 Data Flow

The end-to-end data flow for a single answer submission is as follows:

1. **User Action.** The user reads the displayed interview question, types an answer into the textarea, and clicks "Submit Answer."

2. **Frontend State Transition.** The `PracticeSession` component transitions from the `"answering"` phase to the `"loading"` phase. A spinner is displayed while the API call is in flight.

3. **API Call.** The frontend's `api.ts` service sends a `POST` request to `POST /api/evaluate` with a JSON body containing `topic`, `question`, and `answer`. An optional `notes` field is included when retrieved knowledge is available.

4. **Backend Validation.** The Express route in `evaluate.ts` validates that all required fields (`topic`, `question`, `answer`) are present. If validation fails, a `400 Bad Request` response is returned immediately.

5. **Knowledge Retrieval.** The backend retrieves relevant notes from Google Sheets via the `googleapis` npm package. The notes are included in the prompt as the "Retrieved Notes" section, wrapped in `REFERENCE_NOTES_START` / `REFERENCE_NOTES_END` delimiters for security.

6. **Prompt Construction.** `claudeService.ts` loads the system prompt from `.claude/skills/evaluate-answer/SKILL.md` and constructs a user message containing the question, the user's answer, and any retrieved notes.

7. **Claude API Call.** The backend sends a request to Claude Sonnet 4.6 via raw `fetch` with the system prompt, user message, `temperature: 0.4`, and `max_tokens: 2048`.

8. **Response Processing.** Claude's text response is stripped of markdown code fences and parsed as JSON. The `validateResponse()` function checks that all nine required fields exist and have correct types.

9. **Field Mapping.** The internal `feedback` field from Claude's response is mapped to `coachingFeedback` to match the frontend's `EvaluationResult` interface.

10. **Response Delivery.** The validated evaluation is returned to the frontend as a JSON response.

11. **Frontend State Transition.** On success, the `PracticeSession` component transitions to the `"evaluating"` phase and renders the full evaluation report. On failure, it transitions to the `"error"` phase and displays the error message with retry options.

### 5.3 Project Directory Structure

```

interview-coach/
├── .claude/
│ ├── agents/
│ │ └── interview-coach.md # Agent definition
│ └── skills/
│ ├── evaluate-answer/
│ │ └── SKILL.md # Evaluation system prompt
│ └── generate-questions/
│ └── SKILL.md # Question generation system prompt
├── backend/
│ ├── .env # ANTHROPIC_API_KEY, GOOGLE_SHEET_ID, etc.
│ ├── package.json # Express, googleapis, cors, dotenv, express-rate-limit
│ ├── tsconfig.json # ES2022, ESNext modules
│ └── src/
│ ├── server.ts # Express app setup, CORS, routes, rate limiting
│ ├── routes/
│ │ ├── evaluate.ts # POST /api/evaluate handler
│ │ └── question.ts # POST /api/question, GET /api/topics handlers
│ └── services/
│ ├── claudeService.ts # Claude API client, prompt builder, validator
│ └── questionService.ts # Google Sheets reader, question generation
├── src/
│ ├── main.jsx # React entry point
│ ├── App.jsx # Root component with topic navigation
│ ├── index.css # Tailwind CSS import
│ ├── components/
│ │ ├── WelcomeScreen.tsx # Topic selection screen
│ │ └── PracticeSession.tsx # Interview practice UI
│ └── services/
│ ├── api.ts # Frontend API client (evaluate)
│ ├── questionApi.ts # Frontend API client (questions)
│ └── topicApi.ts # Frontend API client (topics)
├── .env # VITE_API_URL
├── package.json # React, Tailwind, Vite
├── tsconfig.json # Frontend TypeScript config
├── vite.config.js # Vite + React + Tailwind plugins
└── CLAUDE.md # Project instructions

```

---

## 6. Agent Design

### 6.1 Interview Coach Agent

The Interview Coach Agent is defined in `.claude/agents/interview-coach.md` as a design document that outlines the intended responsibilities. In the actual implementation, these responsibilities are handled by two backend services that call the Claude API directly:

| Responsibility         | Implementation                                                      |
| ---------------------- | ------------------------------------------------------------------- |
| **Question Generation** | `claudeService.ts` — `generateQuestions()` function with `generate-questions` skill |
| **Answer Evaluation**   | `claudeService.ts` — `evaluateAnswer()` function with `evaluate-answer` skill     |
| **Knowledge Retrieval** | `questionService.ts` — reads notes from Google Sheets via `googleapis`            |

The agent file serves as a reference for the system's coaching philosophy and intended behaviour. Future versions may implement it as a true runtime agent.

### 6.2 Agent Decision Process

The agent follows a structured decision process for four scenarios:

**Scenario 1 — User starts an interview session.** The agent identifies the requested topic, retrieves relevant notes from Google Sheets, and generates an interview question. Questions are presented one at a time.

**Scenario 2 — User answers a question.** The agent retrieves relevant notes if needed, invokes the Evaluate Answer skill, and returns scores, feedback, an improved answer, and a follow-up question.

**Scenario 3 — User requests an explanation.** The agent explains the concept using retrieved notes when available, provides examples, and focuses on understanding rather than memorisation.

**Scenario 4 — User requests study guidance.** The agent analyses recent performance, identifies knowledge gaps, and recommends specific topics to review.

### 6.3 Question Generation Rules

The agent generates questions that are:

- Relevant to the selected topic.
- Matched to the user's skill level (beginner questions before advanced topics).
- Simulative of real interview questions — conceptual rather than definitional.
- Designed to encourage explanation rather than recall.

For example, the agent prefers "What is useEffect and when would you use it?" over "Define useEffect." Foundational concepts (useState, useEffect, Virtual DOM, Props vs State) are prioritised over advanced internals (Fiber Architecture, Concurrent Rendering, Suspense).

### 6.4 Coaching Behaviour

The agent is explicitly instructed to embody a supportive coaching persona rather than a grading authority:

- Always be supportive, honest, practical, and encouraging.
- Never shame users for incorrect answers.
- Never encourage memorisation of definitions.
- Never inflate scores.
- Never generate overly academic explanations that would not work in a real interview.

The agent's success is measured by whether users become better at explaining technical concepts during interviews — not by how accurately it can grade answers.

---

## 7. Skill Design

### 7.1 Evaluate Answer Skill

The Evaluate Answer skill (`.claude/skills/evaluate-answer/SKILL.md`) serves as the system prompt for Claude during answer evaluation. This file is loaded at module initialisation time by `claudeService.ts` and sent as the `system` parameter in every Claude API call.

### 7.2 Evaluation Dimensions

The skill defines three evaluation dimensions, each scored on a 0–10 scale:

#### Technical Accuracy (Weight: 50%)

Determines whether the answer is technically correct. The evaluator asks: is the explanation accurate? Are there technical mistakes? Does the answer contain misconceptions? A score of 9–10 indicates technical accuracy, while 0–3 indicates the answer is mostly incorrect.

#### Completeness (Weight: 30%)

Determines whether important concepts are included. The evaluator asks: does the answer cover key ideas? Are important concepts missing? Does the answer address the question fully? A score of 9–10 represents a comprehensive answer; 0–3 indicates significant gaps.

#### Communication (Weight: 20%)

Determines whether the answer would work in a real interview. The evaluator asks: is the explanation clear? Is it easy to understand? Does it demonstrate understanding? Does it sound natural? A score of 9–10 indicates strong, interview-ready communication.

### 7.3 Scoring Formula

The overall score is calculated as a weighted combination of the three dimensions:

```

Overall Score = (Technical Accuracy × 0.5) + (Completeness × 0.3) + (Communication × 0.2)

````

The result is rounded to the nearest whole number and displayed as a percentage.

### 7.4 Output Schema

The skill requires Claude to return a structured JSON object with nine fields:

```json
{
  "overallScore": 7,
  "technicalAccuracy": 8,
  "completeness": 6,
  "communication": 7,
  "strengths": ["Correctly explained side effects", "Answer was concise"],
  "missingConcepts": [
    "Did not explain dependency arrays",
    "No practical example provided"
  ],
  "feedback": "Your answer demonstrates a basic understanding...",
  "improvedAnswer": "useEffect is a React Hook used to handle side effects...",
  "followUpQuestion": "What happens when the dependency array is empty?"
}
````

### 7.5 Scoring Philosophy

The skill's scoring philosophy aligns with the coaching-first methodology:

- Reward partial understanding; do not treat incomplete answers as entirely incorrect.
- Prefer coaching over criticism.
- Assume the user is learning.
- Score based on understanding, not memorisation of textbook definitions.
- Do not penalise minor wording issues if the concept is correctly understood.

---

## 8. Google Sheets Integration

### 8.1 Knowledge Source

Google Sheets serves as the knowledge base for Interview Coach AI. The `googleapis` npm package provides direct read access to the spreadsheet using a service account. This approach was chosen for the MVP because it requires no database setup and allows non-technical collaborators to edit content directly in Google Sheets.

### 8.2 Sheet Structure

The spreadsheet is organised with one tab per topic:

```
Interview Notes
├── React          (notes on useEffect, useState, Virtual DOM, etc.)
├── JavaScript     (notes on closures, promises, event loop, etc.)
├── TypeScript     (notes on generics, type narrowing, etc.)
├── APIs           (notes on REST, HTTP methods, status codes, etc.)
├── Databases      (notes on SQL vs NoSQL, indexing, joins, etc.)
├── AI             (notes on machine learning concepts, etc.)
└── Laravel(PHP)   (notes on Laravel framework, PHP concepts, etc.)
```

Topics are discovered dynamically by reading the spreadsheet's tab names. Tabs named "General", "Just FYI", and "Refs" are excluded from the topic list.

### 8.3 Data Retrieval

Column B of each topic tab contains the study notes. The backend reads these notes using the Google Sheets API:

```typescript
const res = await sheets.spreadsheets.values.get({
  spreadsheetId: SHEET_ID!,
  range: `'${topic}'!B2:B`,
});
```

Notes are joined into a single text block and passed to Claude as context for question generation and answer evaluation.

### 8.4 Caching

Two in-memory caches improve performance:

| Cache          | TTL    | Purpose                                        |
| -------------- | ------ | ---------------------------------------------- |
| Topic cache    | 1 hour | Caches the list of valid topic names from tabs |
| Question cache | 10 min | Caches generated questions per topic           |

---

## 9. RAG Workflow

### 9.1 Complete RAG Pipeline

The Retrieval-Augmented Generation workflow in Interview Coach AI operates as follows:

```
┌──────────────────┐
│  Knowledge Base  │
│  (Google Sheets) │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Notes Retrieval │  ← questionService.ts via googleapis
│  (Google Sheets  │
│   API)           │
└────────┬─────────┘
         │
         │ Retrieved notes (topic-specific explanations, examples)
         ▼
┌──────────────────┐
│  Prompt Assembly │  ← claudeService.ts buildUserMessage()
│                  │
│  Components:     │
│  • System prompt │     .claude/skills/evaluate-answer/SKILL.md
│  • Question      │     The interview question
│  • User Answer   │     The answer to evaluate (wrapped in delimiters)
│  • Retrieved     │     Concepts from Google Sheets (wrapped in delimiters)
│    Notes         │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Generation      │  ← Anthropic Claude API (raw fetch)
│  (Claude Sonnet) │
│                  │
│  Temperature: 0.4│
│  Max tokens: 2048│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Response        │  ← JSON parsing + validation
│  Processing      │
│                  │
│  • Strip markdown│
│  • Parse JSON    │
│  • Validate      │
│    schema        │
│  • Map field     │
│    names         │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Frontend        │  ← React renders evaluation report
│  Display         │     with scores, feedback, and
│                  │     follow-up question
└──────────────────┘
```

### 9.2 Prompt Structure

The system prompt loaded from `SKILL.md` contains:

1. **Purpose and identity.** Defines the evaluator's role as a coaching assistant.
2. **Input specification.** Describes the three inputs: Question, User Answer, and Retrieved Notes.
3. **Evaluation criteria.** Detailed scoring rubrics for Technical Accuracy, Completeness, and Communication.
4. **Scoring formula.** The weighted calculation for the overall score.
5. **Feedback guidelines.** Principles for constructive coaching.
6. **Output format.** The exact JSON schema to return.

The user message is constructed as a structured template:

```markdown
## Question

What is useEffect and when would you use it?

## User Answer

useEffect is a React Hook that runs side effects after a component renders.

## Retrieved Notes

useEffect is used for side effects such as API calls, subscriptions, and DOM updates. The dependency array controls when the effect runs. Cleanup functions prevent memory leaks.
```

### 9.3 Response Validation

To ensure reliability, Claude's response undergoes multi-stage validation before being returned to the frontend:

1. **Text extraction.** Non-text content blocks are filtered out. If no text blocks exist, an error is thrown.
2. **Markdown stripping.** Code fences (`` json` and  ``) are removed.
3. **JSON parsing.** The cleaned text is parsed with `JSON.parse()`. Parse failures result in a descriptive error.
4. **Schema validation.** All nine required fields are checked:
   - `overallScore`, `technicalAccuracy`, `completeness`, `communication` must be numbers.
   - `feedback`, `improvedAnswer`, `followUpQuestion` must be strings.
   - `strengths`, `missingConcepts` must be arrays of strings.
5. **Field mapping.** `feedback` is renamed to `coachingFeedback` to match the frontend interface.

This validation layer ensures that the frontend always receives well-formed data, even if Claude produces unexpected output.

---

## 10. Implementation

### 10.1 Frontend Implementation

The frontend is a single-page React application built with Vite and TypeScript. It consists of two main screens:

#### WelcomeScreen

`WelcomeScreen.tsx` is the entry point. It loads available topics from the backend (`GET /api/topics`) on mount and displays them as clickable cards. Topics are loaded dynamically from Google Sheets tabs — no hardcoded topic list. The screen shows a loading spinner while fetching and an error state with retry if the request fails.

#### PracticeSession

`PracticeSession.tsx` manages the interview practice session. It accepts a `topic` prop and uses a state machine pattern with five phases:

| Phase          | Description                                             | UI State                                                         |
| -------------- | ------------------------------------------------------- | ---------------------------------------------------------------- |
| `"answering"`  | User is reading the question and typing an answer       | Question card, textarea (1000 char limit), Submit button         |
| `"loading"`    | Answer has been submitted and the API call is in flight | Spinner with "Evaluating your answer…" message                   |
| `"evaluating"` | Evaluation result has been received                     | Full evaluation report with scores, feedback, and action buttons |
| `"error"`      | API call failed                                         | Error message with "Try Again" and "Edit Answer" buttons         |
| `"complete"`   | All questions have been answered                        | Celebration screen with "Start Again" and topic change buttons   |

#### Dynamic Question Loading

Questions are loaded from the backend (`POST /api/question`). On mount, the component fetches the first question for the selected topic. The backend reads notes from Google Sheets and uses Claude to generate 10 questions dynamically. The "Continue Interview" button advances to the next question; "Finish Interview" appears on the last question.

#### Answer Input Validation

The textarea enforces a 1000-character limit via `maxLength`. A character counter displays `{count} / 1000` below the textarea, turning red when over 800 characters. The Submit button is disabled if the answer exceeds 1000 characters.

#### API Clients

Three API service modules handle backend communication:

- `evaluateApi.ts` — `evaluateAnswer()` for answer evaluation
- `questionApi.ts` — `fetchQuestion()` for loading questions
- `topicApi.ts` — `getTopics()` for loading available topics

The API base URL is configured via the `VITE_API_URL` environment variable, defaulting to `http://localhost:3001`.

#### Styling

Tailwind CSS 4 is integrated via the `@tailwindcss/vite` Vite plugin. No custom CSS is written — all styling is achieved through utility classes. The UI uses a responsive `max-w-5xl` container, a grey background (`bg-gray-50`), and a white card with rounded corners and shadow (`rounded-2xl bg-white shadow-md`). The evaluation report features a dashboard-style layout with colour-coded score cards (green ≥ 80%, amber ≥ 65%, red below), left-accented section cards, and proper list-disc bullet alignment.

### 10.2 Backend Implementation

The backend is an Express 5 server written in TypeScript and executed via `tsx` (TypeScript Execute) without a compilation step during development.

#### Server Setup

`server.ts` initialises the Express application with middleware layers: CORS, JSON body parsing, and environment variable loading via `dotenv` (with `override: true` to handle shell environment conflicts). Routes are mounted under the `/api` prefix. A health-check endpoint at `GET /api/health` confirms the server is running.

Rate limiting is applied to `POST /api/evaluate` in production only (`NODE_ENV=production`): 10 evaluations per hour per IP.

#### Routes

**POST /api/evaluate** — Validates the request body (topic, question, answer), checks answer length (max 1000 characters), validates topic against Google Sheets tabs, delegates to `claudeService.evaluateAnswer()`, and returns the evaluation.

**POST /api/question** — Accepts `{topic, questionIndex}`, retrieves notes from Google Sheets, generates 10 questions via Claude, and returns the requested question.

**GET /api/topics** — Returns the list of valid topic names from Google Sheets tab names (excluding General, Just FYI, Refs).

#### Service: claudeService.ts

The Claude service is the core of the backend and contains two main functions:

**`evaluateAnswer()`** — Evaluates a user's answer using the `evaluate-answer` skill:

- Loads `SKILL.md` as the system prompt at module initialisation.
- Constructs a user message with the question, user answer (wrapped in `USER_ANSWER_START`/`USER_ANSWER_END` delimiters), and retrieved notes (wrapped in `REFERENCE_NOTES_START`/`REFERENCE_NOTES_END` delimiters).
- Calls Claude API via raw `fetch` (not the Anthropic SDK, which had 403 issues).
- Model: `claude-sonnet-4-6`, temperature: 0.4, max_tokens: 2048.
- Parses JSON response and validates all nine required fields.
- Maps `feedback` to `coachingFeedback` for the frontend interface.

**`generateQuestions()`** — Generates 10 interview questions using the `generate-questions` skill:

- Takes study notes as input.
- Calls Claude API with the `generate-questions` skill as system prompt.
- Temperature: 0.7 (higher for question variety).
- Returns a validated array of question strings.

#### Service: questionService.ts

The question service manages Google Sheets integration:

- `getValidTopics()` — reads spreadsheet tab names, excludes system tabs, caches for 1 hour.
- `fetchNotesForTopic()` — reads column B from the topic's tab.
- `loadQuestions()` — reads notes, calls `generateQuestions()`, caches generated questions for 10 minutes.
- `getQuestion()` — validates topic, loads questions, returns the requested question with metadata.

### 10.3 Environment Configuration

Two `.env` files manage environment-specific configuration:

**Frontend (`/.env`):**

```
VITE_API_URL=http://localhost:3001
```

**Backend (`/backend/.env`):**

```
PORT=3001
ANTHROPIC_API_KEY=<Anthropic API key>
GOOGLE_SHEET_ID=<Google Sheet ID>
CLIENT_SERVICE_ACCOUNT_EMAIL=<service account email>
CLIENT_SERVICE_ACCOUNT_KEY=<private key>
```

All environment variables are actively used in the current implementation.

---

## 11. Current Progress

### 11.1 Completed Features

| Feature                             | Status      | Details                                                                    |
| ----------------------------------- | ----------- | -------------------------------------------------------------------------- |
| React frontend with Tailwind CSS    | ✅ Complete | Two-screen SPA (WelcomeScreen + PracticeSession), responsive dashboard UI  |
| Express backend with TypeScript     | ✅ Complete | Three endpoints, CORS, JSON validation, rate limiting (production)         |
| Claude API integration              | ✅ Complete | Sonnet 4.6, two skill files, structured JSON response, raw fetch (not SDK) |
| Dynamic question generation         | ✅ Complete | Claude generates 10 questions per topic from Google Sheets notes           |
| Google Sheets integration           | ✅ Complete | Reads notes via `googleapis`, topics from tab names, 1-hour topic cache    |
| Multi-topic support                 | ✅ Complete | Topics loaded dynamically from Google Sheets tabs                          |
| Welcome screen with topic selection | ✅ Complete | Loads topics from API, displays as clickable cards                         |
| Response validation pipeline        | ✅ Complete | Text extraction, JSON parsing, schema validation, field mapping            |
| Answer input validation             | ✅ Complete | 1000-character limit, character counter, button disable on overflow        |
| Security measures                   | ✅ Complete | User answers and notes wrapped in delimiters, prompt injection protection  |
| Two Claude skills                   | ✅ Complete | `evaluate-answer` and `generate-questions` skills in `.claude/skills/`     |
| Loading and error states            | ✅ Complete | Spinner UI, error screen with retry/edit buttons                           |
| Navigation                          | ✅ Complete | "Choose Another Topic" button in header, back to WelcomeScreen             |

### 11.2 Not Yet Implemented

| Feature                             | Details                                                            |
| ----------------------------------- | ------------------------------------------------------------------ |
| Score history and progress tracking | No database or persistence layer for storing past evaluations      |
| Study plan generation               | Study Planner role defined but has no corresponding UI or endpoint |
| Voice interview mode                | Speech-to-text input for verbal practice                           |

---

## 12. Challenges

### 12.1 Anthropic SDK 403 Errors

The initial implementation used the official `@anthropic-ai/sdk` package, but it consistently returned HTTP 403 errors despite having a valid API key. Raw `curl` requests with the same key worked correctly. The issue was traced to extra headers sent by the SDK. The solution was to replace the SDK with raw `fetch` calls to `api.anthropic.com`, which resolved the authentication issues.

### 12.2 Shell Environment Variable Conflicts

The shell environment contained an old `ANTHROPIC_API_KEY` value that conflicted with the `.env` file. Even with `dotenv.config()`, the shell value took precedence. This was resolved by using `dotenv.config({ override: true })` to force the `.env` file values to override shell environment variables.

### 12.3 Structured Output Reliability

Ensuring that Claude consistently returns valid JSON matching the expected schema required a robust validation pipeline. While Claude generally follows the system prompt's output format instructions, edge cases such as markdown code fences, trailing commas, or unexpected additional commentary must be handled gracefully. The implementation addresses this with markdown fence stripping and comprehensive schema validation.

### 12.4 Skill File Path Resolution

Loading SKILL.md files from the backend required careful path resolution using `import.meta.url` to compute the project root directory. Hardcoding relative paths is fragile across different execution environments. The current approach using `dirname(fileURLToPath(import.meta.url))` with relative traversal to the project root is robust but requires maintenance if the directory structure changes.

### 12.5 Tailwind CSS v4 Setup

Tailwind CSS v4 uses a different configuration approach than v3. The `@tailwindcss/vite` plugin replaces the PostCSS-based setup, and the CSS import changed from `@tailwind base/components/utilities` to `@import "tailwindcss"`. This required updating both the Vite config and the main CSS file.

### 12.6 Prompt Injection Protection

User answers are untrusted input that could contain instructions attempting to manipulate Claude's behaviour. This was addressed by wrapping user answers and retrieved notes in clear delimiters (`USER_ANSWER_START`/`USER_ANSWER_END`, `REFERENCE_NOTES_START`/`REFERENCE_NOTES_END`) and adding explicit security instructions to the evaluation skill prompt.

---

## 13. Future Improvements

### 13.1 Persistence and Progress Tracking

Add a database layer (e.g., SQLite or PostgreSQL) to store:

- User practice history.
- Scores over time.
- Frequently missed concepts.
- Topic proficiency levels.

This would enable the Study Planner Agent to generate personalised study recommendations based on historical performance data.

### 13.5 Agent Decomposition

Split the monolithic Interview Coach Agent into specialised sub-agents as suggested in CLAUDE.md:

- **Question Agent.** Focused solely on generating and selecting appropriate questions.
- **Evaluator Agent.** Focused on scoring and identifying gaps.
- **Coach Agent.** Focused on providing feedback and improved answers.
- **Study Planner Agent.** Focused on analysing performance trends and recommending learning paths.

Each agent would have its own system prompt and could be called independently or composed in a workflow.

### 13.6 Authentication and User Accounts

Add user authentication to support individual practice histories, personalised question recommendations, and progress dashboards. This could be implemented using JWT-based authentication with a simple user database.

### 13.7 Real-time Voice Practice

Extend the application to support voice input, simulating the verbal nature of real technical interviews. Speech-to-text integration would transcribe the user's spoken answer, which would then be evaluated through the same pipeline.

### 13.8 Shared Type Definitions

Extract the shared `EvaluationResult` type into a monorepo package or use a tool like `openapi-typescript` to generate frontend types from the backend's API specification, eliminating the risk of contract drift.

### 13.9 Testing

Add comprehensive testing across all layers:

- Unit tests for `validateResponse()` and `buildUserMessage()`.
- Integration tests for the API route with mocked Claude responses.
- End-to-end tests with Jest or Playwright or Cypress for the full user flow.
- Contract tests to ensure frontend-backend API compatibility.

---

## 14. Conclusion

Interview Coach AI demonstrates a practical application of Retrieval-Augmented Generation for technical interview preparation. By combining a React frontend, an Express backend, the Anthropic Claude API, and a Google Sheets knowledge base accessed via the `googleapis` npm package, the system provides a coaching-oriented alternative to passive study methods.

The project's key contributions are:

1. **A coaching-first evaluation methodology** that assesses understanding across three dimensions (technical accuracy, completeness, and communication) and provides actionable feedback rather than just a score.

2. **A RAG pipeline** that augments Claude's parametric knowledge with curated technical content from Google Sheets, grounding evaluations in domain-specific reference material.

3. **A clean separation of concerns** between the Agent definition, the Skill definition (which serves as the system prompt), and the backend service that orchestrates the Claude API call and response validation.

4. **A resilient response processing pipeline** that handles JSON parsing, schema validation, and field mapping to ensure the frontend always receives well-formed data.

5. **A user experience designed for iterative learning**, with phases for answering, loading, evaluation, error recovery, and session completion, plus the ability to retry answers after reviewing feedback.

The current implementation provides a functional MVP that supports full answer-evaluation round-trips across multiple topics (React, JavaScript, TypeScript, APIs, Databases, AI, Laravel). Future work will focus on adding persistence for progress tracking, voice interview mode, and user authentication.

The architecture is intentionally simple — suitable for a MVP — while providing clear extension points for the features identified in the project roadmap. The coaching philosophy of prioritising understanding over memorisation is embedded throughout the system, from the agent's behavioural guidelines to the skill's scoring rubrics and the frontend's iterative practice flow.

---

## References

- Anthropic. (2026). _Claude API Documentation_. Available at: https://docs.anthropic.com/en/docs
- Anthropic. (2024). _Model Context Protocol Specification_. Available at: https://modelcontextprotocol.io
- React. (2026). _React Documentation_. Available at: https://react.dev
- Tailwind CSS. (2026). _Tailwind CSS v4 Documentation_. Available at: https://tailwindcss.com
- Vite. (2026). _Vite Documentation_. Available at: https://vite.dev
- Express. (2026). _Express 5 Documentation_. Available at: https://expressjs.com
