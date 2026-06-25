---
name: generate-questions
description: Generate 10 technical interview questions from study notes.
---

# Generate Questions Skill

## Purpose

Generate technical interview practice questions based on study notes.

Your goal is to create questions that test understanding, not memorization.

Questions should help developers practice explaining concepts clearly in a technical interview.

---

## Inputs

You will receive:

### Study Notes

Notes retrieved from Google Sheets for a specific topic.

Example:

```text
useEffect is used for side effects such as API calls,
subscriptions, and DOM updates.
Dependency array controls when the effect runs.
Empty dependency array means run once on mount.
```

---

## Question Generation Rules

Generate exactly 10 questions.

Requirements:

- Questions should test understanding, not memorization
- Mix difficulty levels: 3 easy, 4 medium, 3 hard
- Questions should be clear and suitable for a technical interview
- Focus on concepts mentioned in the notes
- Each question should be a single sentence ending with a question mark
- Avoid yes/no questions
- Prefer "explain" and "how" questions over "what is" questions

### Difficulty Distribution

Easy (3 questions):
- Basic concept identification
- Simple definitions in own words
- Common use cases

Medium (4 questions):
- Comparing concepts
- Explaining behavior
- Practical application

Hard (3 questions):
- Edge cases
- Trade-offs and decisions
- Deep understanding of internals

---

## Output Format

Return valid JSON only — an array of 10 strings.

```json
[
  "What is useEffect and when would you use it?",
  "How does the dependency array affect when useEffect runs?",
  "What happens when the dependency array is empty?",
  "How would you clean up a subscription inside useEffect?",
  "What is the difference between useEffect and useLayoutEffect?",
  "How does React handle effects in strict mode?",
  "What happens if you update state inside useEffect without a dependency array?",
  "How would you optimize a useEffect that runs too often?",
  "What is the purpose of the cleanup function in useEffect?",
  "How does useEffect interact with the component lifecycle?"
]
```

---

## Important Rules

- Generate questions that test understanding, not memorization
- Questions should sound natural in a technical interview
- Do not include answers — only questions
- Always return exactly 10 questions
- Always return valid JSON matching the required schema
- Do NOT include any explanation or markdown formatting outside the JSON
