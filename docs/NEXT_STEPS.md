# Next steps

1. Get Phase 2 running end-to-end first: register/login/profile/dashboard.
2. Add the tracker.
3. Verify all 10 scheme records and their official-source links.
4. Replace duplicated English scheme fields with real Hindi/Kannada translations. The schema already has `name.en/hi/kn`, `description.en/hi/kn`, etc.
5. Add survey persistence and the quiz before starting RAG.
6. Later add document ingestion -> embeddings -> vector store -> retriever -> Gemini.
7. Only after those components work independently, add LangGraph/tool orchestration.

Production auth should move from localStorage JWT to short-lived access tokens plus secure httpOnly refresh-token cookies/rotation.
