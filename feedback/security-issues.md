# Security Issues — Interview Coach AI

These security issues were identified through code review (Codex security audit) and have been fixed.

## Security Issues (July 20, 2026)

| #   | Issue title                                                 | Priority  | GitHub link                                                  | Status |
| --- | ----------------------------------------------------------- | --------- | ------------------------------------------------------------ | ------ |
| 19  | Security: Restrict CORS to allowed origins                  | High      | [#19](https://github.com/sandarma/Interview-Coach-AI/issues/19) | Fixed  |
| 20  | Security: Add rate limiting to all API routes               | High      | [#20](https://github.com/sandarma/Interview-Coach-AI/issues/20) | Fixed  |
| 21  | Security: Sanitize error messages                           | Medium    | [#21](https://github.com/sandarma/Interview-Coach-AI/issues/21) | Fixed  |
| 22  | Security: Add input validation to all routes                | Medium    | [#22](https://github.com/sandarma/Interview-Coach-AI/issues/22) | Fixed  |
| 23  | Security: Remove client-supplied notes from evaluate endpoint | Medium  | [#23](https://github.com/sandarma/Interview-Coach-AI/issues/23) | Fixed  |

## Security Findings from Codex Audit

### HIGH: Public API can burn paid Anthropic quota

- **Issue:** CORS allows any origin, and the API has no auth
- **File:** `backend/src/server.ts` (line 14)
- **Fix:** Restrict CORS to allowed origins via `ALLOWED_ORIGINS` env var

### HIGH: Rate limiting only on /api/evaluate

- **Issue:** `/api/question` can also trigger Claude via `questionService.ts`
- **File:** `backend/src/server.ts` (line 18)
- **Fix:** Add rate limiting to `/api/question` and `/api/topics`

### MEDIUM: Raw internal/upstream errors returned to clients

- **Issue:** Exception text exposed, including Anthropic error details
- **Files:** `evaluate.ts`, `question.ts`, `questionService.ts`
- **Fix:** Return generic client errors, log detailed errors server-side only

### MEDIUM: User-controlled notes and question trusted for paid model calls

- **Issue:** Client-supplied notes sent directly to Claude
- **File:** `evaluate.ts` (line 16)
- **Fix:** Remove client-supplied notes, validate question against server-issued question

### LOW: CORS wider than needed

- **Issue:** Default `cors()` allows all origins
- **File:** `server.ts` (line 14)
- **Fix:** Restrict to deployed frontend origin via env

## Files Changed

| File | Changes |
| --- | --- |
| `backend/src/server.ts` | CORS restriction, rate limiters, body size limit |
| `backend/src/routes/evaluate.ts` | Input validation, error sanitization, removed notes param |
| `backend/src/routes/question.ts` | Input validation, error sanitization |
| `backend/src/services/claudeService.ts` | Error sanitization |
| `src/services/evaluateApi.ts` | Removed notes parameter |
| `backend/.env.example` | Added ALLOWED_ORIGINS, fixed API key name |

## Status

✅ All security issues fixed — Ready for review and push
