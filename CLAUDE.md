# Interview Coach AI — Claude Instructions

## Project purpose

You are helping build Interview Coach AI.

The purpose of this application is to help developers improve their technical interview performance by practicing explanations rather than memorizing answers.

Always optimize for:

- Understanding over memorization
- Clear communication over keyword matching
- Learning over scoring
- Coaching over judging

The application should simulate a supportive technical interviewer that helps users identify knowledge gaps and improve their explanations.

---

## Tech stack

Assume the following technology stack unless explicitly instructed otherwise:

### Frontend

- React
- TypeScript
- Tailwind CSS

### Backend

- Node.js
- Express

### AI

- Anthropic Claude API

### Knowledge Source

- Google Sheets

### Methodology

- Retrieval-Augmented Generation (RAG)

### Knowledge Retrieval

- Google Sheets API via `googleapis` npm package

When generating code:

- Prefer TypeScript.
- Prefer simple, maintainable solutions.
- Keep the architecture suitable for a weekend MVP.

---

## Security

### reCAPTCHA v3

- Backend verifies tokens via `https://www.google.com/recaptcha/api/siteverify`.
- Uses invisible scoring (0.0 = bot, 1.0 = human) with threshold 0.5.
- Token is fetched client-side via `window.grecaptcha.execute()` and sent in the request body.
- Fail-open: if reCAPTCHA is unreachable, the request is still allowed for UX reasons.

### Input Validation

All routes validate input types, lengths, and required fields:

| Route      | Validations                                                                 |
| ---------- | --------------------------------------------------------------------------- |
| `/api/evaluate` | Type checks, trim checks, length limits (topic ≤100, question ≤1000, answer ≤1000), topic validated against Google Sheets |
| `/api/question` | Type checks, length limits, questionIndex validated (non-negative integer, ≤100) |

### Rate Limiting

- **Global**: 100 requests/hour per IP.
- **Evaluate**: 10 requests/hour per IP.
- **Question**: 30 requests/hour per IP.
- **Topics**: 20 requests/hour per IP.
- All rate limiters return proper `Retry-After` headers.

### CORS

- Restricted to `ALLOWED_ORIGINS` environment variable (comma-separated).
- Null origin rejected in production (prevents curl/script bypass).
- Disallowed origins return 403 (not 500) via `callback(null, false)`.

### Other Security Headers

- **helmet**: Sets security headers (X-Content-Type-Options, X-Frame-Options, etc.).
- **trust proxy**: Enabled for Render load balancer.
- **Body size limit**: `express.json({ limit: "10kb" })`.
- **Error sanitization**: Detailed errors logged server-side; generic messages returned to client.

---

## Plugins

The project has been audited using the following plugins:

| Plugin | Skills |
|--------|--------|
| `vibecode@litellm` | `code-review`, `security-review`, `pitch-coach` |

These plugins performed:
- **Code review**: 8-finder-angle analysis with 10 adversarial verifier agents
- **Security review**: Comprehensive audit with OWASP-recommended findings
- **Pitch coach**: Generated a 2-minute project pitch

---

## Environment Variables

### Frontend (`.env` / Vercel)

```text
VITE_API_URL=https://your-backend.onrender.com
VITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
```

### Backend (`backend/.env` / Render)

```text
PORT=3001
ANTHROPIC_API_KEY=your-anthropic-api-key
GOOGLE_SHEET_ID=your-google-sheet-id
CLIENT_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
CLIENT_SERVICE_ACCOUNT_KEY=your-private-key
ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:5173
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
```

---

## Agent

### Interview Coach Agent

The project currently uses a single Interview Coach Agent.

This agent combines four responsibilities:

- Question Generation
- Answer Evaluation
- Coaching Feedback
- Study Planning

Located at: `.claude/agents/interview-coach.md`

Future versions may split these responsibilities into separate agents.

Responsibilities:

- Generate interview questions
- Evaluate user answers
- Provide coaching feedback
- Recommend study topics
- Retrieve knowledge from Google Sheets via the `googleapis` npm package

---

## Skill

### Evaluate Answer

Use this skill when:

- A user submits an answer to an interview question.

Responsibilities:

- Evaluate technical accuracy
- Evaluate completeness
- Evaluate communication clarity
- Generate scores
- Identify missing concepts
- Provide coaching feedback
- Generate a follow-up question

Input:

- Question
- User Answer
- Retrieved Notes

Output:

- Scores
- Strengths
- Missing Concepts
- Improved Answer
- Follow-up Question

---

## Knowledge Source

### Google Sheets API (googleapis)

Google Sheets is the primary knowledge source, accessed via the `googleapis` npm package in the backend.

Expected sheet structure:

```text
Interview Notes
├── React
├── JavaScript
├── APIs
├── AI
└── Laravel(PHP)
```

Responsibilities:

- Read interview notes from Google Sheets tabs.
- Retrieve concepts relevant to the selected topic.
- Retrieve examples and explanations.

Future capabilities:

- Store practice history.
- Track scores.

Before generating questions:

1. Retrieve relevant notes from Google Sheets.
2. Use retrieved notes as context.
3. Generate questions based on retrieved content.

Prefer retrieved knowledge over assumptions whenever possible.

---

## Interview Topics

The application currently supports interview practice in:

- React
- JavaScript
- APIs
- AI
- Laravel (PHP)

Topics are stored in Google Sheets and retrieved through the `googleapis` npm package.

---

## How Claude should behave while helping build this

Always prioritize a working MVP over perfect architecture.

When making implementation decisions:

- Choose the simplest solution that works.
- Avoid unnecessary complexity.
- Avoid premature optimization.
- Avoid enterprise-level architecture.

Code generation guidelines:

- Use TypeScript.
- Use functional React components.
- Keep components small.
- Separate UI from business logic.
- Create reusable services for Claude API calls.
- Use environment variables for secrets.
- Prefer readability over cleverness.

User experience guidelines:

- Be supportive but honest.
- Encourage understanding.
- Avoid encouraging memorized answers.
- Explain concepts clearly.
- Provide actionable feedback.

Scope guidelines:

Always prioritize:

1. Interview Coach Agent
2. Evaluate Answer Skill
3. Google Sheets integration
4. Question generation
5. Answer evaluation
6. Coaching feedback

Do not introduce additional agents or skills unless they provide clear value to the MVP.

---

## Current Architecture

Current implementation:

- One Agent: Interview Coach Agent
- Two Skills: Evaluate Answer, Generate Questions
- One Knowledge Source: Google Sheets via `googleapis`
- Security: reCAPTCHA v3, helmet, CORS, rate limiting, input validation
- Plugins: vibecode@litellm (code-review, security-review, pitch-coach)

Future versions may introduce:

- Question Agent
- Evaluator Agent
- Coach Agent
- Study Planner Agent
- Additional skills
