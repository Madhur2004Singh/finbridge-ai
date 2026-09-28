import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: "light", // 'light' | 'dark'
      toggleTheme: () =>
        set((s) => {
          const next = s.theme === "light" ? "dark" : "light";
          if (typeof document !== "undefined") {
            document.documentElement.classList.toggle("dark", next === "dark");
          }
          return { theme: next };
        }),
      setTheme: (theme) => {
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", theme === "dark");
        }
        set({ theme });
      },
    }),
    { name: "finbridge-theme" }
  )
);
