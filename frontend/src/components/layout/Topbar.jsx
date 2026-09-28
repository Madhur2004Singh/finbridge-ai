import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../stores/auth.store";
import { useThemeStore } from "../../stores/theme.store";

export default function Topbar() {
  const { t, i18n } = useTranslation();
  const { u, logout } = useAuth();
  const { theme, toggleTheme } = useThemeStore();
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
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              <span>{item.icon}</span>
              {t(item.key)}
            </NavLink>
          ))}
        </nav>

        <div className="topbar-actions">
          <button
            onClick={toggleTheme}
            className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition"
            title={`Switch to ${theme === "light" ? "dark" : "light"}`}
            aria-label="Toggle theme"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

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
            <div className="avatar">{(u?.name || "U").charAt(0).toUpperCase()}</div>
            <div className="user-mini-text">
              <strong>{u?.name || "User"}</strong>
              <span>{u?.occupation || "Member"}</span>
            </div>
          </div>

          <button className="logout-button" onClick={handleLogout}>
            ↪ <span>{t("logout")}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
