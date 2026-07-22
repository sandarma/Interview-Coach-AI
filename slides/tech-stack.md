---
marp: true
paginate: true
theme: default
---

# Interview Coach AI

### Tech Stack & AI Workflow

Sandar Min Aye

---

# Tech Stack

## Frontend

- React 19
- TypeScript
- Tailwind CSS 4
- Vite

## Backend

- Node.js
- Express 5
- TypeScript

## Deployment

- Vercel (Frontend)
- Render (Backend)

---

# Security

## reCAPTCHA v3

- Invisible bot detection
- Score-based (0.5 threshold)
- Integrated on evaluate endpoint

## Rate Limiting

- Global: 100 req/hr
- Evaluate: 10 req/hr
- Question: 30 req/hr
- Topics: 20 req/hr

---

# Security (cont.)

## CORS

- Restricted to ALLOWED_ORIGINS
- Null origin rejected in production
- Returns proper 403

## Helmet

- Security headers
- X-Content-Type-Options
- X-Frame-Options

## Input Validation

- Type checks, length limits
- Topic validated against Google Sheets
- Error messages sanitized

---

# Plugins & Tooling

## vibecode@litellm

| Skill | Purpose |
|-------|---------|
| `code-review` | 8-angle code analysis with adversarial verification |
| `security-review` | OWASP-based audit |
| `pitch-coach` | 2-minute project pitch |

## Chrome DevTools MCP

- Screenshots
- Performance audits
- UI testing

---

# AI & Knowledge Base

## AI

- Claude API (claude-sonnet-4-6)
- Two skills: `evaluate-answer`, `generate-questions`

## Knowledge Source

- Google Sheets (via Google Sheets API - `googleapis` npm package)
- Retrieval-Augmented Generation (RAG)
- In-memory caching (10 min for questions, 1 hour for topics)

---

# AI Agent & Skill

## Subagent

**Interview Coach Agent**

Responsibilities:

- Generate interview questions
- Evaluate answers
- Provide coaching feedback
- Recommend next question

---

# Skill

## Evaluate Answer Skill

Input

- Interview Question
- User Answer
- Retrieved Notes

Output

- Technical Accuracy
- Completeness
- Communication
- Overall Score
- Feedback
- Improved Answer
- Follow-up Question

---

# Methodology

```text
React Frontend
        ↓
Express Backend
        ↓
Google Sheets
(Retrieve Questions & Notes)
        ↓
Claude API
(Evaluate Answer)
        ↓
AI Coaching Feedback
```
