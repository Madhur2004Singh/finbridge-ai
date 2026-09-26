import React, { useEffect, useMemo, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  NavLink,
  Outlet,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useTranslation } from "react-i18next";

import api from "./api";
import { useAuth } from "./auth";

/* =========================================================
   HELPERS
========================================================= */

const languageNames = {
  en: "English",
  hi: "हिंदी",
  kn: "ಕನ್ನಡ",
};

const categoryIcons = {
  food: "🍱",
  travel: "🚕",
  bills: "🧾",
  shopping: "🛍️",
  education: "📚",
  health: "❤️",
  savings: "💰",
  other: "📌",
};

const literacyIcons = {
  banking: "🏦",
  investments: "📈",
  taxes: "🧾",
  procedures: "📋",
  digital: "📱",
};

function localized(value, language = "en") {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[language] || value.en || value.hi || value.kn || "";
}

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function Loading({ text = "Loading..." }) {
  return (
    <div className="loading-state">
      <div className="spinner" />
      <span>{text}</span>
    </div>
  );
}

function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <div className="alert error-alert">
      <span>⚠️</span>
      <span>{message}</span>
    </div>
  );
}

function EmptyState({ icon = "📭", title, text }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
    </div>
  );
}

/* =========================================================
   AUTH
========================================================= */

function Guard({ children }) {
  const { u } = useAuth();

  return u ? children : <Navigate to="/login" replace />;
}

function AuthPage({ register = false }) {
  const { login } = useAuth();
  const nav = useNavigate();

  const [f, setF] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    setErr("");

    if (!f.email || !f.password || (register && !f.name)) {
      setErr("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.post(
        `/auth/${register ? "register" : "login"}`,
        f
      );

      login(data);
      nav("/dashboard");
    } catch (e) {
      setErr(e.response?.data?.message || "Unable to complete the request.");
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
            Your bridge to better financial awareness, government schemes and
            digital financial services.
          </p>

          <div className="auth-feature-list">
            <div>
              <span>🏦</span>
              <span>Understand financial services</span>
            </div>

            <div>
              <span>🏛️</span>
              <span>Discover government schemes</span>
            </div>

            <div>
              <span>📊</span>
              <span>Track your everyday expenses</span>
            </div>

            <div>
              <span>🌐</span>
              <span>Learn in your preferred language</span>
            </div>
          </div>
        </div>

        <form className="auth-card" onSubmit={submit}>
          <div className="mobile-brand">
            <div className="brand-mark">F</div>
            <span>FinBridge AI</span>
          </div>

          <div className="auth-card-header">
            <span className="eyebrow">
              {register ? "GET STARTED" : "WELCOME BACK"}
            </span>

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
          </label>

          <ErrorMessage message={err} />

          <button className="btn primary full-width" disabled={loading}>
            {loading
              ? "Please wait..."
              : register
                ? "Create account →"
                : "Sign in →"}
          </button>

          <div className="auth-switch">
            {register ? (
              <>
                Already have an account?
                <NavLink to="/login"> Sign in</NavLink>
              </>
            ) : (
              <>
                Don't have an account?
                <NavLink to="/register"> Create one</NavLink>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   LAYOUT
========================================================= */

function Layout() {
  const { t, i18n } = useTranslation();
  const { logout, u } = useAuth();
  const nav = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation = [
    { path: "/dashboard", key: "dashboard", icon: "⌂" },
    { path: "/schemes", key: "schemes", icon: "🏛️" },
    { path: "/tracker", key: "tracker", icon: "📊" },
    { path: "/literacy", key: "literacy", icon: "📚" },
    { path: "/profile", key: "profile", icon: "👤" },
  ];

  const handleLogout = () => {
    logout();
    nav("/login");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/dashboard" className="brand">
            <span className="brand-mark">F</span>
            <span>
              <strong>FinBridge</strong>
              <small>AI</small>
            </span>
          </NavLink>

          <button
            className="mobile-menu-button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            ☰
          </button>

          <nav className={`main-nav ${mobileOpen ? "mobile-open" : ""}`}>
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                <span>{item.icon}</span>
                {t(item.key)}
              </NavLink>
            ))}
          </nav>

          <div className="topbar-actions">
            <select
              className="language-select"
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
            >
              <option value="en">EN</option>
              <option value="hi">हिंदी</option>
              <option value="kn">ಕನ್ನಡ</option>
            </select>

            <div className="user-mini">
              <div className="avatar">
                {(u?.name || "U").charAt(0).toUpperCase()}
              </div>

              <div className="user-mini-text">
                <strong>{u?.name || "User"}</strong>
                <span>{u?.occupation || "Member"}</span>
              </div>
            </div>

            <button className="logout-button" onClick={handleLogout}>
              ↪
              <span>{t("logout")}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="page-container">
        <Outlet />
      </main>

      <footer className="footer">
        <div>
          <strong>FinBridge AI</strong>
          <span> • Financial awareness & inclusion</span>
        </div>
        <span>Built for education, awareness and accessibility.</span>
      </footer>
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {
  const { t, i18n } = useTranslation();
  const { u } = useAuth();

  const [d, setD] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function fetchDashboard() {
      try {
        setError("");

        const { data } = await api.get("/dashboard");

        if (mounted) {
          setD(data);
        }
      } catch (e) {
        if (mounted) {
          setError(
            e.response?.data?.message || "Unable to load your dashboard."
          );
        }
      }
    }

    fetchDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  if (!d && !error) {
    return <Loading text="Preparing your dashboard..." />;
  }

  const recommendations = d?.recommendations || [];

  return (
    <div className="dashboard-page">
      <section className="welcome-banner">
        <div>
          <span className="eyebrow">YOUR FINANCIAL HUB</span>

          <h1>
            {t("dashboard")},{" "}
            <span>{u?.name?.split(" ")[0] || "there"} 👋</span>
          </h1>

          <p>
            Learn, discover and manage your financial information from one
            place.
          </p>
        </div>

        <div className="welcome-illustration">💰</div>
      </section>

      <ErrorMessage message={error} />

      {d && (
        <>
          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">₹</div>
              <div>
                <span>Total expenses</span>
                <strong>{formatCurrency(d.totalExpenses)}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">🏛️</div>
              <div>
                <span>Recommended schemes</span>
                <strong>{recommendations.length}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon purple">📚</div>
              <div>
                <span>Financial learning</span>
                <strong>Explore</strong>
              </div>
            </div>
          </section>

          <section className="dashboard-grid">
            <div className="dashboard-main-card">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">PERSONALIZED FOR YOU</span>
                  <h2>Recommended schemes</h2>
                </div>

                <NavLink to="/schemes" className="text-link">
                  View all →
                </NavLink>
              </div>

              {recommendations.length === 0 ? (
                <EmptyState
                  icon="🏛️"
                  title="No recommendations yet"
                  text="Complete more of your profile to discover relevant schemes."
                />
              ) : (
                <div className="recommendation-list">
                  {recommendations.slice(0, 4).map((x) => (
                    <NavLink
                      key={x.scheme.slug}
                      to={`/schemes/${x.scheme.slug}`}
                      className="recommendation-item"
                    >
                      <div className="scheme-icon">🏛️</div>

                      <div className="recommendation-content">
                        <strong>
                          {localized(x.scheme.name, i18n.language)}
                        </strong>

                        <span>
                          {localized(
                            x.scheme.description,
                            i18n.language
                          )}
                        </span>
                      </div>

                      <span className="arrow">→</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            <div className="dashboard-side-card">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">LEARN</span>
                  <h2>Financial literacy</h2>
                </div>
              </div>

              <p className="muted">
                Build your understanding of banking, digital payments,
                investments and taxes.
              </p>

              <div className="learning-mini-list">
                <div>
                  <span>🏦</span>
                  <strong>Banking basics</strong>
                </div>

                <div>
                  <span>📱</span>
                  <strong>Digital payments</strong>
                </div>

                <div>
                  <span>📈</span>
                  <strong>Investments</strong>
                </div>

                <div>
                  <span>🧾</span>
                  <strong>Taxes</strong>
                </div>
              </div>

              <NavLink to="/literacy" className="btn secondary full-width">
                Start learning →
              </NavLink>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

/* =========================================================
   SCHEMES
========================================================= */

function Schemes() {
  const { t, i18n } = useTranslation();

  const [s, setS] = useState([]);
  const [q, setQ] = useState("");
  const [rec, setRec] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function fetchSchemes() {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get(
          rec ? "/schemes/recommendations" : "/schemes"
        );

        const schemes = rec
          ? data.recommendations.map((x) => x.scheme)
          : data.schemes;

        if (mounted) {
          setS(schemes || []);
        }
      } catch (e) {
        if (mounted) {
          setError(
            e.response?.data?.message || "Unable to load government schemes."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchSchemes();

    return () => {
      mounted = false;
    };
  }, [rec]);

  const filteredSchemes = useMemo(() => {
    const search = q.trim().toLowerCase();

    if (!search) return s;

    return s.filter((x) => {
      const name = localized(x.name, i18n.language).toLowerCase();
      const description = localized(
        x.description,
        i18n.language
      ).toLowerCase();

      return name.includes(search) || description.includes(search);
    });
  }, [s, q, i18n.language]);

  return (
    <div className="content-page">
      <section className="page-hero scheme-hero">
        <div>
          <span className="eyebrow">FINANCIAL INCLUSION</span>
          <h1>{t("schemes")}</h1>
          <p>
            Discover government schemes and understand their eligibility,
            benefits and application process.
          </p>
        </div>

        <div className="hero-icon">🏛️</div>
      </section>

      <div className="toolbar">
        <div className="search-wrapper">
          <span>⌕</span>
          <input
            className="search-input"
            placeholder={t("search")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <button
          className={`filter-button ${rec ? "selected" : ""}`}
          onClick={() => setRec(!rec)}
        >
          {rec ? "✓ Recommended" : "Show recommended"}
        </button>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <Loading text="Finding schemes..." />
      ) : filteredSchemes.length === 0 ? (
        <EmptyState
          icon="🔎"
          title="No schemes found"
          text="Try another search term or view all schemes."
        />
      ) : (
        <div className="scheme-grid">
          {filteredSchemes.map((x) => (
            <NavLink
              to={`/schemes/${x.slug}`}
              className="scheme-card"
              key={x._id}
            >
              <div className="scheme-card-top">
                <div className="scheme-icon large">🏛️</div>
                <span className="scheme-category">{x.category}</span>
              </div>

              <h2>{localized(x.name, i18n.language)}</h2>

              <p>{localized(x.description, i18n.language)}</p>

              <span className="scheme-card-link">
                {t("details")} <span>→</span>
              </span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   SCHEME DETAIL
========================================================= */

function Scheme() {
  const { t, i18n } = useTranslation();
  const { slug } = useParams();

  const [s, setS] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function fetchScheme() {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get(`/schemes/${slug}`);

        if (mounted) {
          setS(data.scheme);
        }
      } catch (e) {
        if (mounted) {
          setError(
            e.response?.data?.message || "Unable to load this scheme."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchScheme();

    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) {
    return <Loading text="Loading scheme details..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!s) {
    return (
      <EmptyState
        icon="🏛️"
        title="Scheme not found"
        text="The requested government scheme could not be found."
      />
    );
  }

  const sections = [
    {
      title: t("eligibility"),
      icon: "✓",
      items: s.eligibility,
    },
    {
      title: t("benefits"),
      icon: "💰",
      items: s.benefits,
    },
    {
      title: t("documents"),
      icon: "📄",
      items: s.documentsRequired,
    },
    {
      title: t("application"),
      icon: "📋",
      items: s.applicationSteps,
    },
  ];

  return (
    <div className="scheme-detail-page">
      <NavLink to="/schemes" className="back-link">
        ← Back to schemes
      </NavLink>

      <section className="scheme-detail-header">
        <div className="scheme-icon huge">🏛️</div>

        <div>
          <span className="scheme-category">{s.category}</span>
          <h1>{localized(s.name, i18n.language)}</h1>
          <p>{localized(s.description, i18n.language)}</p>
        </div>
      </section>

      <div className="detail-sections">
        {sections.map((section) => (
          <section className="detail-card" key={section.title}>
            <div className="detail-card-heading">
              <span>{section.icon}</span>
              <h2>{section.title}</h2>
            </div>

            <ul>
              {(section.items || []).map((item, index) => (
                <li key={index}>{localized(item, i18n.language)}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="official-source">
        <div>
          <span className="eyebrow">OFFICIAL INFORMATION</span>
          <h3>Verify the latest details</h3>
          <p>
            Scheme rules, eligibility and application requirements may change.
            Always verify the latest information using the official source.
          </p>
        </div>

        <a
          className="btn primary"
          href={s.officialSource}
          target="_blank"
          rel="noreferrer"
        >
          Visit official source ↗
        </a>
      </div>
    </div>
  );
}

/* =========================================================
   TRACKER
========================================================= */

function Tracker() {
  const { t } = useTranslation();

  const [m, setM] = useState(new Date());
  const [es, setE] = useState([]);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  const [f, setF] = useState({
    amount: "",
    category: "food",
    note: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const ms = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(
    2,
    "0"
  )}`;

  async function loadExpenses() {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get(`/expenses?month=${ms}`);

      setE(data.expenses || []);
    } catch (e) {
      setError(
        e.response?.data?.message || "Unable to load your expenses."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExpenses();
  }, [ms]);

  const days = new Date(
    m.getFullYear(),
    m.getMonth() + 1,
    0
  ).getDate();

  const firstDay = new Date(
    m.getFullYear(),
    m.getMonth(),
    1
  ).getDay();

  const total = es.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  const selectedExpenses = es.filter(
    (e) => new Date(e.date).getDate() === selectedDay
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!f.amount || Number(f.amount) <= 0) {
      setError("Please enter a valid expense amount.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.post("/expenses", {
        ...f,
        amount: Number(f.amount),
        date: new Date(
          m.getFullYear(),
          m.getMonth(),
          selectedDay
        ).toISOString(),
      });

      setF({
        amount: "",
        category: "food",
        note: "",
      });

      await loadExpenses();
    } catch (e) {
      setError(
        e.response?.data?.message || "Unable to save the expense."
      );
    } finally {
      setSaving(false);
    }
  };

  const changeMonth = (offset) => {
    const next = new Date(
      m.getFullYear(),
      m.getMonth() + offset,
      1
    );

    setM(next);

    const nextDays = new Date(
      next.getFullYear(),
      next.getMonth() + 1,
      0
    ).getDate();

    setSelectedDay(Math.min(selectedDay, nextDays));
  };

  return (
    <div className="content-page">
      <section className="page-hero tracker-hero">
        <div>
          <span className="eyebrow">YOUR MONEY</span>
          <h1>{t("tracker")}</h1>
          <p>
            Record your everyday spending and get a simple view of where your
            money goes.
          </p>
        </div>

        <div className="hero-icon">📊</div>
      </section>

      <ErrorMessage message={error} />

      <div className="tracker-summary">
        <div className="tracker-total">
          <span>{t("total")}</span>
          <strong>{formatCurrency(total)}</strong>
          <small>{m.toLocaleDateString(undefined, {
            month: "long",
            year: "numeric",
          })}</small>
        </div>

        <div className="tracker-tip">
          <span>💡</span>
          <div>
            <strong>Small habit, useful insight</strong>
            <p>Recording expenses regularly can help you understand your spending patterns.</p>
          </div>
        </div>
      </div>

      <div className="tracker-layout">
        <section className="calendar-card">
          <div className="calendar-header">
            <button
              className="icon-button"
              onClick={() => changeMonth(-1)}
            >
              ←
            </button>

            <h2>
              {m.toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </h2>

            <button
              className="icon-button"
              onClick={() => changeMonth(1)}
            >
              →
            </button>
          </div>

          {loading ? (
            <Loading text="Loading expenses..." />
          ) : (
            <>
              <div className="calendar-weekdays">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <span key={day}>{day}</span>
                  )
                )}
              </div>

              <div className="calendar-grid">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div className="calendar-empty" key={`empty-${i}`} />
                ))}

                {Array.from({ length: days }, (_, i) => i + 1).map((day) => {
                  const dayExpenses = es.filter(
                    (e) => new Date(e.date).getDate() === day
                  );

                  const dayTotal = dayExpenses.reduce(
                    (sum, e) => sum + Number(e.amount || 0),
                    0
                  );

                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`calendar-day ${
                        selectedDay === day ? "selected" : ""
                      }`}
                    >
                      <span>{day}</span>

                      {dayTotal > 0 && (
                        <small>{formatCurrency(dayTotal)}</small>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </section>

        <section className="expense-panel">
          <div className="expense-panel-header">
            <span className="eyebrow">SELECTED DATE</span>
            <h2>
              {m.toLocaleDateString(undefined, {
                day: "numeric",
                month: "long",
              })}
            </h2>
          </div>

          {selectedExpenses.length > 0 && (
            <div className="selected-expenses">
              <h3>Expenses on this day</h3>

              {selectedExpenses.map((expense) => (
                <div className="expense-row" key={expense._id}>
                  <div className="expense-category-icon">
                    {categoryIcons[expense.category] || "📌"}
                  </div>

                  <div>
                    <strong>{expense.category}</strong>
                    <span>{expense.note || "No note"}</span>
                  </div>

                  <b>{formatCurrency(expense.amount)}</b>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="expense-form">
            <h3>Add expense</h3>

            <label className="field">
              <span>Amount</span>
              <input
                className="input"
                type="number"
                min="1"
                placeholder="₹ 500"
                value={f.amount}
                onChange={(e) =>
                  setF({ ...f, amount: e.target.value })
                }
              />
            </label>

            <label className="field">
              <span>Category</span>
              <select
                className="input"
                value={f.category}
                onChange={(e) =>
                  setF({ ...f, category: e.target.value })
                }
              >
                {Object.keys(categoryIcons).map((x) => (
                  <option key={x} value={x}>
                    {categoryIcons[x]} {x}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Note</span>
              <input
                className="input"
                placeholder="What was this expense for?"
                value={f.note}
                onChange={(e) =>
                  setF({ ...f, note: e.target.value })
                }
              />
            </label>

            <button className="btn primary full-width" disabled={saving}>
              {saving ? "Saving..." : `${t("save")} expense`}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   FINANCIAL LITERACY
========================================================= */

const literacy = {
  banking: [
    [
      "Savings account",
      "An account designed for saving money while allowing deposits and withdrawals.",
    ],
    [
      "Current account",
      "An account generally designed for frequent business transactions.",
    ],
    [
      "Fixed Deposit (FD)",
      "A fixed deposit keeps money for a chosen period under stated terms and interest.",
    ],
    [
      "Recurring Deposit (RD)",
      "A recurring deposit involves making regular deposits for a chosen period.",
    ],
    [
      "Credit score",
      "A credit score is based on credit information and may be considered by lenders.",
    ],
  ],

  investments: [
    [
      "Bond",
      "A debt instrument where an issuer borrows money under specified repayment terms.",
    ],
    [
      "SIP",
      "A Systematic Investment Plan allows a fixed amount to be invested periodically in a mutual fund scheme.",
    ],
    [
      "Mutual fund",
      "A pooled investment vehicle managed according to the objectives of its scheme.",
    ],
    [
      "PPF",
      "The Public Provident Fund is a government-backed long-term savings scheme.",
    ],
    [
      "Saving vs investing",
      "Saving generally emphasizes liquidity, while investing generally involves accepting risk for potential returns.",
    ],
  ],

  taxes: [
    [
      "PAN",
      "Permanent Account Number used for income-tax and other financial purposes.",
    ],
    [
      "ITR",
      "Income Tax Return used to report relevant income and tax information.",
    ],
    [
      "TDS",
      "Tax Deducted at Source from certain payments under applicable rules.",
    ],
    [
      "GST",
      "Goods and Services Tax is an indirect tax framework.",
    ],
    [
      "Assessment year",
      "The year following a financial year in which income is assessed or returned under applicable rules.",
    ],
  ],

  procedures: [
    [
      "PAN application",
      "Use an official PAN service, provide the required identity, address and date-of-birth information, and complete verification.",
    ],
    [
      "ITR filing",
      "Collect relevant income and tax documents, choose the applicable ITR, submit it, verify the return and retain the acknowledgement.",
    ],
    [
      "Open a bank account",
      "Choose an account, review its requirements, submit KYC documents and complete the bank's verification process.",
    ],
    [
      "Use UPI safely",
      "Never share OTPs or UPI PINs. Verify the recipient and amount before confirming a payment.",
    ],
  ],

  digital: [
    [
      "UPI",
      "A digital payment system that supports transfers between participating bank accounts.",
    ],
    [
      "QR payment",
      "A payment initiated by scanning a QR code and confirming the transaction in a payment application.",
    ],
    [
      "Mobile banking",
      "Using a bank's mobile application to access supported banking services.",
    ],
    [
      "Internet banking",
      "Using a bank's website to access supported banking services.",
    ],
  ],
};

function Literacy() {
  const { t } = useTranslation();
  const [k, setK] = useState("banking");

  const categoryNames = {
    banking: "Banking",
    investments: "Investments",
    taxes: "Taxes",
    procedures: "Financial procedures",
    digital: "Digital finance",
  };

  return (
    <div className="content-page">
      <section className="page-hero literacy-hero">
        <div>
          <span className="eyebrow">LEARN & UNDERSTAND</span>
          <h1>{t("literacy")}</h1>
          <p>
            Understand common financial terms and everyday financial
            procedures in simple language.
          </p>
        </div>

        <div className="hero-icon">📚</div>
      </section>

      <div className="literacy-layout">
        <aside className="literacy-sidebar">
          <h3>Topics</h3>

          {Object.keys(literacy).map((x) => (
            <button
              key={x}
              className={`literacy-tab ${k === x ? "active" : ""}`}
              onClick={() => setK(x)}
            >
              <span>{literacyIcons[x]}</span>
              {categoryNames[x]}
              <span className="tab-arrow">→</span>
            </button>
          ))}
        </aside>

        <section className="literacy-content">
          <div className="literacy-heading">
            <span>{literacyIcons[k]}</span>
            <div>
              <span className="eyebrow">TOPIC</span>
              <h2>{categoryNames[k]}</h2>
            </div>
          </div>

          <div className="literacy-cards">
  {literacy[k].map(([title, description], index) => (
    <article className="literacy-card" key={title}>
      <div className="literacy-card-number">
        {index + 1}
      </div>

      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </article>
  ))}
</div>
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   PROFILE
========================================================= */

function Profile() {
  const { u, updateUser } = useAuth();

  const [f, setF] = useState({
    ...u,
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const update = (key, value) => {
    setF((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const { data } = await api.patch("/users/profile", f);

      const updatedUser = data.user || f;

      updateUser(updatedUser);
      setF(updatedUser);
      setMessage("Profile updated successfully.");
    } catch (e) {
      setError(
        e.response?.data?.message || "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="content-page">
      <section className="page-hero profile-hero">
        <div>
          <span className="eyebrow">YOUR INFORMATION</span>
          <h1>Profile</h1>
          <p>
            Keep your basic information updated so FinBridge can provide more
            relevant educational content and scheme recommendations.
          </p>
        </div>

        <div className="profile-avatar-large">
          {(u?.name || "U").charAt(0).toUpperCase()}
        </div>
      </section>

      <form className="profile-form" onSubmit={submit}>
        <div className="profile-section">
          <div className="profile-section-heading">
            <span>👤</span>
            <div>
              <h2>Personal information</h2>
              <p>Basic information about you.</p>
            </div>
          </div>

          <div className="form-grid">
            <label className="field">
              <span>Name</span>
              <input
                className="input"
                value={f.name || ""}
                onChange={(e) => update("name", e.target.value)}
              />
            </label>

            <label className="field">
              <span>Email</span>
              <input
                className="input"
                value={f.email || ""}
                disabled
              />
            </label>

            <label className="field">
              <span>State</span>
              <input
                className="input"
                placeholder="e.g. Karnataka"
                value={f.state || ""}
                onChange={(e) => update("state", e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="profile-section">
          <div className="profile-section-heading">
            <span>📊</span>
            <div>
              <h2>Financial profile</h2>
              <p>
                This information helps provide more relevant recommendations.
              </p>
            </div>
          </div>

          <div className="form-grid">
            <label className="field">
              <span>Age group</span>
              <select
                className="input"
                value={f.ageGroup || ""}
                onChange={(e) => update("ageGroup", e.target.value)}
              >
                <option value="">Select age group</option>
                {["18-25", "26-40", "41-60", "60+"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Occupation</span>
              <select
                className="input"
                value={f.occupation || ""}
                onChange={(e) => update("occupation", e.target.value)}
              >
                <option value="">Select occupation</option>
                {[
                  "student",
                  "salaried",
                  "small_business",
                  "farmer",
                  "daily_wage",
                  "homemaker",
                  "senior_citizen",
                  "other",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Income range</span>
              <select
                className="input"
                value={f.incomeRange || ""}
                onChange={(e) => update("incomeRange", e.target.value)}
              >
                <option value="">Select income range</option>
                {[
                  "below_15000",
                  "15000_30000",
                  "30000_60000",
                  "above_60000",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <ErrorMessage message={error} />

        {message && <div className="alert success-alert">✓ {message}</div>}

        <button className="btn primary" disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}

/* =========================================================
   APP ROUTES
========================================================= */

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage register />} />

      <Route
        path="/"
        element={
          <Guard>
            <Layout />
          </Guard>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="schemes" element={<Schemes />} />
        <Route path="schemes/:slug" element={<Scheme />} />
        <Route path="tracker" element={<Tracker />} />
        <Route path="literacy" element={<Literacy />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}