import "./i18n";
import "./style.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Auth } from "./auth";
import App from "./App";
import { useThemeStore } from "./stores/theme.store";

// Initialize theme from persisted store (add .dark class if needed)
try {
  const raw = localStorage.getItem("finbridge-theme");
  if (raw) {
    const parsed = JSON.parse(raw);
    const theme = parsed?.state?.theme;
    if (theme === "dark") document.documentElement.classList.add("dark");
  }
} catch {}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Auth>
        <App />
      </Auth>
    </BrowserRouter>
  </React.StrictMode>
);
