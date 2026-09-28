import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../stores/auth.store";
import client from "../../api/client";
import { localized, formatCurrency } from "../../lib/utils";
import Loading from "../../components/ui/Loading";
import ErrorMessage from "../../components/ui/ErrorMessage";
import EmptyState from "../../components/ui/EmptyState";

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { u } = useAuth();
  const [d, setD] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function fetchDashboard() {
      try {
        setError("");
        const { data } = await client.get("/dashboard");
        if (mounted) setD(data);
      } catch (e) {
        if (mounted) setError(e.response?.data?.message || "Unable to load your dashboard.");
      }
    }
    fetchDashboard();
    return () => { mounted = false; };
  }, []);

  if (!d && !error) return <Loading text="Preparing your dashboard..." />;

  const recommendations = d?.recommendations || [];

  return (
    <div className="dashboard-page">
      <section className="welcome-banner">
        <div>
          <span className="eyebrow">YOUR FINANCIAL HUB</span>
          <h1>
            {t("dashboard")}, <span>{u?.name?.split(" ")[0] || "there"} 👋</span>
          </h1>
          <p>Learn, discover and manage your financial information from one place.</p>
        </div>
        <div className="welcome-illustration">💰</div>
      </section>

      <ErrorMessage message={error} />

      {d && (
        <>
          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">₹</div>
              <div><span>Total expenses</span><strong>{formatCurrency(d.totalExpenses)}</strong></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">🏛️</div>
              <div><span>Recommended schemes</span><strong>{recommendations.length}</strong></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon purple">📚</div>
              <div><span>Financial learning</span><strong>Explore</strong></div>
            </div>
          </section>

          <section className="dashboard-grid">
            <div className="dashboard-main-card">
              <div className="section-heading">
                <div><span className="eyebrow">PERSONALIZED FOR YOU</span><h2>Recommended schemes</h2></div>
                <NavLink to="/schemes" className="text-link">View all →</NavLink>
              </div>
              {recommendations.length === 0 ? (
                <EmptyState icon="🏛️" title="No recommendations yet" text="Complete more of your profile to discover relevant schemes." />
              ) : (
                <div className="recommendation-list">
                  {recommendations.slice(0, 4).map((x) => (
                    <NavLink key={x.scheme.slug} to={`/schemes/${x.scheme.slug}`} className="recommendation-item">
                      <div className="scheme-icon">🏛️</div>
                      <div className="recommendation-content">
                        <strong>{localized(x.scheme.name, i18n.language)}</strong>
                        <span>{localized(x.scheme.description, i18n.language)}</span>
                      </div>
                      <span className="arrow">→</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            <div className="dashboard-side-card">
              <div className="section-heading"><div><span className="eyebrow">LEARN</span><h2>Financial literacy</h2></div></div>
              <p className="muted">Build your understanding of banking, digital payments, investments and taxes.</p>
              <div className="learning-mini-list">
                <div><span>🏦</span><strong>Banking basics</strong></div>
                <div><span>📱</span><strong>Digital payments</strong></div>
                <div><span>📈</span><strong>Investments</strong></div>
                <div><span>🧾</span><strong>Taxes</strong></div>
              </div>
              <NavLink to="/literacy" className="btn secondary full-width">Start learning →</NavLink>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
