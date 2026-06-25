---
marp: true
paginate: true
transition: fade
auto-advance: 20
---

<!-- slide 1 -->

# Who's my person?

Developers and job seekers preparing for technical interviews

They understand many technical concepts but struggle to explain them clearly during interviews.

Examples:

- What is useEffect?
- What is a Higher Order Function?
- What's the difference between PUT and PATCH?

Under pressure, they often forget concepts they already know.

---

<!-- slide 2 -->

# Their problem

Technical interviews test communication, not just knowledge.

Problems:

- Forgetting concepts during interviews
- Difficulty explaining ideas clearly
- Lack of personalised feedback
- Unsure what topics need more practice

Many candidates understand concepts but cannot confidently explain them.

---

<!-- slide 3 -->

# What I built

## Interview Coach AI

An AI-powered interview practice tool.

Features:

- Dynamic topic selection from Google Sheets
- AI-generated interview questions (10 per topic)
- AI answer evaluation
- Coaching feedback with improved answers
- Follow-up interview questions

Focus:

Understanding over memorisation.

---

<!-- slide 4 -->

# How I built it

### Skills

Evaluate Answer + Generate Questions

- Scores responses across 3 dimensions
- Identifies missing concepts
- Creates coaching feedback
- Generates 10 questions from study notes

### RAG Pipeline

Google Sheets → Claude API

- Reads study notes from Google Sheets tabs
- Notes provide context for question generation
- Notes ground evaluations in curated content

### Tech Stack

React + Express + Claude API + Google Sheets

---

<!-- slide 5 -->

# Why it matters

Benefits:

- Builds interview confidence
- Improves technical communication
- Identifies knowledge gaps
- Encourages understanding instead of memorisation

The goal is to help developers explain concepts clearly in real interviews.

---

<!-- slide 6 -->

# Done checklist

- [x] Repo public
- [x] Two skills implemented (evaluate + generate)
- [x] React frontend with topic selection
- [x] Express backend with 3 endpoints
- [x] Claude API connected (raw fetch)
- [x] Google Sheets connected (googleapis)
- [x] Dynamic question generation
- [x] Prompt injection protection
- [x] Rate limiting (production)
- [x] report.md committed
