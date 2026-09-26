# Architecture

React/Vite -> Express REST API -> layered services/controllers -> MongoDB Atlas. JWT protects user/profile/expense/recommendation endpoints. Scheme data is stored separately so new schemes can be added without changing UI code.

```text
User
  |
React + Router + i18next
  | HTTPS/REST
Express
  +-- Auth -> User
  +-- Profile -> User
  +-- Schemes -> Scheme -> Recommendation rules
  +-- Expenses -> Expense -> monthly totals
  +-- Dashboard -> aggregates
  |
MongoDB Atlas

Future extension points: /survey /quiz /chat /rag /scam /admin -> AI orchestrator -> tools/RAG/Gemini
```

The project proposal explicitly places Phase 2 as React/Express/MongoDB/authentication/profile/dashboard and Phase 3 as financial literacy, government scheme database, quiz, survey dashboard and basic recommendation engine.
