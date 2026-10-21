import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../stores/auth.store";
import client from "../../api/client";
import { registerSchema, loginSchema } from "../../lib/schemas";

export default function AuthPage({ register = false }) {
  const { login } = useAuth();
  const nav = useNavigate();

  const [f, setF] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [err, setErr] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const schema = register ? registerSchema : loginSchema;

  const validateField = (key, value) => {
    let message = "";
    if (register && key === "confirmPassword") {
      message = value === f.password ? "" : "Passwords do not match";
    } else if (key === "name" && !register) {
      message = "";
    } else if (schema.shape[key]) {
      const result = schema.shape[key].safeParse(value);
      message = result.success ? "" : result.error.issues[0].message;
    }
    setFieldErrors((prev) => ({ ...prev, [key]: message }));
  };

  const update = (key) => (e) => {
    const value = e.target.value;
    setF((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: "" }));
    }
    if (key === "password" && register && f.confirmPassword) {
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: value === f.confirmPassword ? "" : "Passwords do not match",
      }));
    }
  };

  const blur = (key) => (e) => validateField(key, e.target.value.trim());

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    const payload = register
      ? { name: f.name.trim(), email: f.email.trim(), password: f.password }
      : { email: f.email.trim(), password: f.password };

    const errors = {};
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      parsed.error.issues.forEach((iss) => {
        errors[iss.path[0]] = iss.message;
      });
    }
    if (register && f.password !== f.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setErr("Please fix the highlighted fields.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await client.post(
        `/auth/${register ? "register" : "login"}`,
        payload
      );
      login(data);
      nav("/dashboard");
    } catch (e) {
      const msg = e.response?.data?.message || "Unable to complete the request.";
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

  const pwdType = showPassword ? "text" : "password";

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
                className={`input ${fieldErrors.name ? "input-error" : ""}`}
                placeholder="Enter your name"
                autoComplete="name"
                value={f.name}
                onChange={update("name")}
                onBlur={blur("name")}
              />
              {fieldErrors.name && <small className="field-error">{fieldErrors.name}</small>}
            </label>
          )}

          <label className="field">
            <span>Email</span>
            <input
              className={`input ${fieldErrors.email ? "input-error" : ""}`}
              placeholder="you@example.com"
              type="email"
              autoComplete="email"
              value={f.email}
              onChange={update("email")}
              onBlur={blur("email")}
            />
            {fieldErrors.email && <small className="field-error">{fieldErrors.email}</small>}
          </label>

          <label className="field">
            <span>Password</span>
            <div className="password-input">
              <input
                className={`input ${fieldErrors.password ? "input-error" : ""}`}
                placeholder={register ? "At least 8 characters" : "Enter your password"}
                type={pwdType}
                autoComplete={register ? "new-password" : "current-password"}
                value={f.password}
                onChange={update("password")}
                onBlur={blur("password")}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {fieldErrors.password && <small className="field-error">{fieldErrors.password}</small>}
          </label>

          {register && (
            <label className="field">
              <span>Confirm password</span>
              <input
                className={`input ${fieldErrors.confirmPassword ? "input-error" : ""}`}
                placeholder="Re-enter your password"
                type={pwdType}
                autoComplete="new-password"
                value={f.confirmPassword}
                onChange={update("confirmPassword")}
                onBlur={blur("confirmPassword")}
              />
              {fieldErrors.confirmPassword && (
                <small className="field-error">{fieldErrors.confirmPassword}</small>
              )}
            </label>
          )}

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
