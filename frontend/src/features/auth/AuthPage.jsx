import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../stores/auth.store";
import client from "../../api/client";
import { registerSchema, loginSchema } from "../../lib/schemas";

export default function AuthPage({ register = false }) {
  const { login } = useAuth();
  const nav = useNavigate();

  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setFieldErrors({});

    // Zod validation
    const schema = register ? registerSchema : loginSchema;
    const parsed = schema.safeParse(f);
    if (!parsed.success) {
      const errors = {};
      parsed.error.issues.forEach((iss) => {
        errors[iss.path[0]] = iss.message;
      });
      setFieldErrors(errors);
      setErr("Please fix the highlighted fields.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await client.post(`/auth/${register ? "register" : "login"}`, f);
      login(data);
      nav("/dashboard");
    } catch (e) {
      const msg = e.response?.data?.message || "Unable to complete the request.";
      // show field errors if returned
      if (e.response?.data?.errors?.length) {
        const fe = {};
        e.response.data.errors.forEach((er) => (fe[er.field] = er.message));
        setFieldErrors(fe);
      }
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-background-shape shape-one" />
      <div className="auth-background-shape shape-two" />
      <div className="auth-layout">
        <div className="auth-brand-panel">
          <div className="brand-mark large">F</div>
          <h1>FinBridge AI</h1>
          <p>
            Your bridge to better financial awareness, government schemes and digital financial
            services.
          </p>
          <div className="auth-feature-list">
            <div><span>🏦</span><span>Understand financial services</span></div>
            <div><span>🏛️</span><span>Discover government schemes</span></div>
            <div><span>📊</span><span>Track your everyday expenses</span></div>
            <div><span>🌐</span><span>Learn in your preferred language</span></div>
          </div>
        </div>

        <form className="auth-card" onSubmit={submit} noValidate>
          <div className="mobile-brand">
            <div className="brand-mark">F</div>
            <span>FinBridge AI</span>
          </div>

          <div className="auth-card-header">
            <span className="eyebrow">{register ? "GET STARTED" : "WELCOME BACK"}</span>
            <h2>{register ? "Create your account" : "Welcome back"}</h2>
            <p>
              {register
                ? "Create your FinBridge account to get started."
                : "Sign in to continue to your financial dashboard."}
            </p>
          </div>

          {register && (
            <label className="field">
              <span>Name</span>
              <input
                className="input"
                placeholder="Enter your name"
                value={f.name}
                onChange={(e) => setF({ ...f, name: e.target.value })}
              />
              {fieldErrors.name && <small className="text-red-600 text-xs mt-1">{fieldErrors.name}</small>}
            </label>
          )}

          <label className="field">
            <span>Email</span>
            <input
              className="input"
              placeholder="you@example.com"
              type="email"
              value={f.email}
              onChange={(e) => setF({ ...f, email: e.target.value })}
            />
            {fieldErrors.email && <small className="text-red-600 text-xs mt-1">{fieldErrors.email}</small>}
          </label>

          <label className="field">
            <span>Password</span>
            <input
              className="input"
              placeholder="Enter your password"
              type="password"
              value={f.password}
              onChange={(e) => setF({ ...f, password: e.target.value })}
            />
            {fieldErrors.password && <small className="text-red-600 text-xs mt-1">{fieldErrors.password}</small>}
          </label>

          {err && (
            <div className="alert error-alert">
              <span>⚠️</span>
              <span>{err}</span>
            </div>
          )}

          <button className="btn primary full-width" disabled={loading}>
            {loading ? "Please wait..." : register ? "Create account →" : "Sign in →"}
          </button>

          <div className="auth-switch">
            {register ? (
              <>
                Already have an account? <NavLink to="/login"> Sign in</NavLink>
              </>
            ) : (
              <>
                Don't have an account? <NavLink to="/register"> Create one</NavLink>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
