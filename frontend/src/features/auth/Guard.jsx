import { Navigate } from "react-router-dom";
import { useAuth } from "../../stores/auth.store";

export default function Guard({ children }) {
  const { isAuthenticated, u } = useAuth();
  // check both zustand and legacy token
  const token = (() => {
    try {
      return localStorage.getItem("fb_token");
    } catch {
      return null;
    }
  })();

  if (!u && !token) return <Navigate to="/login" replace />;
  return children;
}
