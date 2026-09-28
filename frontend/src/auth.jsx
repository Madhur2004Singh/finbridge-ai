// Backward compat shim — Zustand store is source of truth
// New code should import from "@/stores/auth.store.js" or "@/hooks/useAuth.js"
import React from "react";
import { useAuth as useAuthHook } from "./stores/auth.store.js";

export function Auth({ children }) {
  // Zustand is global, no provider needed — keep wrapper for compat
  return <>{children}</>;
}

export const useAuth = useAuthHook;
export { useAuthHook };