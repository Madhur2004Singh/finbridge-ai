import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import client from "../../api/client";
import { localized } from "../../lib/utils";
import { useDebounce } from "../../hooks/useDebounce";
import Loading from "../../components/ui/Loading";
import ErrorMessage from "../../components/ui/ErrorMessage";
import EmptyState from "../../components/ui/EmptyState";

export default function Schemes() {
  const { t, i18n } = useTranslation();
  const [s, setS] = useState([]);
  const [q, setQ] = useState("");
  const [rec, setRec] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // debounce search input for system design: avoid filtering on every keystroke
  const debouncedQ = useDebounce(q, 300);

  useEffect(() => {
    let mounted = true;
    async function fetchSchemes() {
      try {
        setLoading(true);
        setError("");
        const { data } = await client.get(rec ? "/schemes/recommendations" : "/schemes");
        const schemes = rec ? data.recommendations.map((x) => x.scheme) : data.schemes;
        if (mounted) setS(schemes || []);
      } catch (e) {
        if (mounted) setError(e.response?.data?.message || "Unable to load government schemes.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchSchemes();
    return () => { mounted = false; };
  }, [rec]);

  const filteredSchemes = useMemo(() => {
    const search = debouncedQ.trim().toLowerCase();
    if (!search) return s;
    return s.filter((x) => {
      const name = localized(x.name, i18n.language).toLowerCase();
      const description = localized(x.description, i18n.language).toLowerCase();
      return name.includes(search) || description.includes(search);
    });
  }, [s, debouncedQ, i18n.language]);

  return (
    <div className="content-page">
      <section className="page-hero scheme-hero">
        <div>
          <span className="eyebrow">FINANCIAL INCLUSION</span>
          <h1>{t("schemes")}</h1>
          <p>Discover government schemes and understand their eligibility, benefits and application process.</p>
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
        <button className={`filter-button ${rec ? "selected" : ""}`} onClick={() => setRec(!rec)}>
          {rec ? "✓ Recommended" : "Show recommended"}
        </button>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <Loading text="Finding schemes..." />
      ) : filteredSchemes.length === 0 ? (
        <EmptyState icon="🔎" title="No schemes found" text="Try another search term or view all schemes." />
      ) : (
        <div className="scheme-grid">
          {filteredSchemes.map((x) => (
            <NavLink to={`/schemes/${x.slug}`} className="scheme-card" key={x._id}>
              <div className="scheme-card-top">
                <div className="scheme-icon large">🏛️</div>
                <span className="scheme-category">{x.category}</span>
              </div>
              <h2>{localized(x.name, i18n.language)}</h2>
              <p>{localized(x.description, i18n.language)}</p>
              <span className="scheme-card-link">{t("details")} <span>→</span></span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
