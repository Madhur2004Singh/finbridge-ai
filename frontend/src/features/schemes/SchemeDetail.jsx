import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import client from "../../api/client";
import { localized } from "../../lib/utils";
import Loading from "../../components/ui/Loading";
import ErrorMessage from "../../components/ui/ErrorMessage";
import EmptyState from "../../components/ui/EmptyState";

export default function SchemeDetail() {
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
        const { data } = await client.get(`/schemes/${slug}`);
        if (mounted) setS(data.scheme);
      } catch (e) {
        if (mounted) setError(e.response?.data?.message || "Unable to load this scheme.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchScheme();
    return () => { mounted = false; };
  }, [slug]);

  if (loading) return <Loading text="Loading scheme details..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!s) return <EmptyState icon="🏛️" title="Scheme not found" text="The requested government scheme could not be found." />;

  const sections = [
    { title: t("eligibility"), icon: "✓", items: s.eligibility },
    { title: t("benefits"), icon: "💰", items: s.benefits },
    { title: t("documents"), icon: "📄", items: s.documentsRequired },
    { title: t("application"), icon: "📋", items: s.applicationSteps },
  ];

  return (
    <div className="scheme-detail-page">
      <NavLink to="/schemes" className="back-link">← Back to schemes</NavLink>
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
            <div className="detail-card-heading"><span>{section.icon}</span><h2>{section.title}</h2></div>
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
          <p>Scheme rules, eligibility and application requirements may change. Always verify the latest information using the official source.</p>
        </div>
        <a className="btn primary" href={s.officialSource} target="_blank" rel="noreferrer">Visit official source ↗</a>
      </div>
    </div>
  );
}
