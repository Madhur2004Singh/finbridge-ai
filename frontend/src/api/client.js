import axios from "axios";
import { env } from "../config/env";

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

// Response interceptor: handle 401 globally
client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // optional: clear auth if token expired (don't auto-redirect here to avoid loop)
      // handled by Guard
    }
    return Promise.reject(error);
  }
);

export default client;
