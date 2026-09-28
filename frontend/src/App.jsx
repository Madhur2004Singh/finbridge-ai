import React from "react";
import AppRoutes from "./routes/index";

// Thin wrapper — all feature code is now code-split via src/routes/index.jsx
// System design: lazy loading + Suspense, debounce in Schemes, Zustand for auth/theme, Zod for validation
export default function App() {
  return <AppRoutes />;
}
