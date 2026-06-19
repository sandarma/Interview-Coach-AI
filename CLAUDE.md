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

### MCP

- Google Sheets MCP Server

When generating code:

- Prefer TypeScript.
- Prefer simple, maintainable solutions.
- Keep the architecture suitable for a weekend MVP.

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
- Retrieve knowledge from Google Sheets via MCP

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

## MCP servers

### Google Sheets MCP Server

Use this server as the primary knowledge source.

Expected sheet structure:

```text
Interview Notes
├── React
├── JavaScript
├── TypeScript
├── APIs
└── Databases
```

Responsibilities:

- Read interview notes.
- Retrieve concepts relevant to the selected topic.
- Retrieve examples and explanations.

Future capabilities:

- Store practice history.
- Track scores.

Before generating questions:

1. Retrieve relevant notes.
2. Use retrieved notes as context.
3. Generate questions based on retrieved content.

Prefer retrieved knowledge over assumptions whenever possible.

---

## Interview Topics

The application currently supports interview practice in:

- React
- JavaScript
- TypeScript
- APIs
- Databases

Topics are stored in Google Sheets and retrieved through MCP.

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
3. Google Sheets MCP integration
4. Question generation
5. Answer evaluation
6. Coaching feedback

Do not introduce additional agents or skills unless they provide clear value to the MVP.

---

## Current Architecture

Current implementation:

- One Agent: Interview Coach Agent
- One Skill: Evaluate Answer
- One MCP: Google Sheets MCP

Future versions may introduce:

- Question Agent
- Evaluator Agent
- Coach Agent
- Study Planner Agent
- Additional skills
