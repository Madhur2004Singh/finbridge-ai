import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: (() => {
        try {
          return localStorage.getItem("fb_token") || null;
        } catch {
          return null;
        }
      })(),
      // actions
      login: (data) =>
        set(() => {
          try {
            localStorage.setItem("fb_token", data.token);
            localStorage.setItem("fb_user", JSON.stringify(data.user));
          } catch {}
          return { user: data.user, token: data.token };
        }),
      updateUser: (user) =>
        set(() => {
          try {
            localStorage.setItem("fb_user", JSON.stringify(user));
          } catch {}
          return { user };
        }),
      logout: () =>
        set(() => {
          try {
            localStorage.removeItem("fb_token");
            localStorage.removeItem("fb_user");
          } catch {}
          return { user: null, token: null };
        }),
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
    }),
    {
      name: "finbridge-auth",
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

// Backward compat hook: App.jsx uses `const { u } = useAuth()` and `login`, `logout`, `updateUser`
export const useAuth = () => {
  const { user, token, login, logout, updateUser } = useAuthStore();
  // Fallback to legacy localStorage on first render if zustand empty
  const legacyUser = (() => {
    if (user) return user;
    try {
      const raw = localStorage.getItem("fb_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const legacyToken = token || (() => {
    try {
      return localStorage.getItem("fb_token");
    } catch {
      return null;
    }
  })();

  const effectiveUser = user ?? legacyUser;
  const effectiveToken = token ?? legacyToken;

  return {
    u: effectiveUser,
    user: effectiveUser,
    token: effectiveToken,
    login,
    logout,
    updateUser,
    isAuthenticated: !!effectiveToken,
  };
};
