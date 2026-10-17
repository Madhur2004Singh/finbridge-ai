import axios from "axios";
import { env } from "../config/env";
import { useAuthStore } from "../stores/auth.store";

const client = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: attach token from zustand or legacy localStorage
client.interceptors.request.use((config) => {
  try {
    const token =
      localStorage.getItem("fb_token") ||
      JSON.parse(localStorage.getItem("finbridge-auth") || "{}")?.state?.token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

// Endpoints where a 401 means "wrong credentials", not "expired session".
const isCredentialAttempt = (url = "") =>
  url.includes("/auth/login") || url.includes("/auth/register");

// Response interceptor: an invalid/expired token logs the user out once and
// sends them to the login page (previously this did nothing, so the app kept
// firing authenticated requests with a dead token -> repeated "invalid token").
client.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    if (status === 401 && !isCredentialAttempt(url)) {
      useAuthStore.getState().logout();
      try {
        localStorage.removeItem("fb_token");
        localStorage.removeItem("fb_user");
      } catch {}
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login")
      ) {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default client;
