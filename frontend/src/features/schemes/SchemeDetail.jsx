
import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import client from "../../api/client";
import { localized } from "../../lib/utils";
import Loading from "../../components/ui/Loading";
import ErrorMessage from "../../components/ui/ErrorMessage";
import EmptyState from "../../components/ui/EmptyState";

// Remove Markdown syntax and make links readable.
function cleanText(value) {
  if (value == null) return "";

  const text =
    typeof value === "string" ? value : String(value);

  return text
    .replace(/\r/g, "")
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      "$1 ($2)"
    )
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/(?<!\*)\*(?!\s)(.*?)(?<!\s)\*(?!\*)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Resolve the selected language and clean the resulting text.
function getReadableText(value, language) {
  if (value == null) return "";

  const translated =
    typeof value === "object"
      ? localized(value, language)
      : value;

  return cleanText(translated);
}

// Split multiline content into readable list items.
function getItems(items, language) {
  if (!items) return [];

  const values = Array.isArray(items) ? items : [items];

  return values
    .flatMap((item) => {
      const text = getReadableText(item, language);

      // Split paragraphs or numbered steps stored in one string.
      return text
        .split(/\n+/)
        .map((line) =>
          line
            .replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "")
            .trim()
        );
    })
    .filter(Boolean);
}

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

        if (mounted) {
          setS(data.scheme);
        }
      } catch (e) {
        if (mounted) {
          setError(
            e.response?.data?.message ||
              "Unable to load this scheme."
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

  const language = i18n.language;

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
      numbered: true,
    },
  ];

  const category = getReadableText(s.category, language);
  const name = getReadableText(s.name, language);
  const description = getReadableText(s.description, language);

  return (
    <div className="scheme-detail-page">
      <NavLink to="/schemes" className="back-link">
        ← Back to schemes
      </NavLink>

      <section className="scheme-detail-header">
        <div className="scheme-icon huge" aria-hidden="true">
          🏛️
        </div>

        <div className="scheme-detail-intro">
          {category && (
            <span className="scheme-category">
              {category}
            </span>
          )}

          <h1>{name}</h1>

          {description && <p>{description}</p>}
        </div>
      </section>

      <div className="detail-sections">
        {sections.map((section) => {
          const items = getItems(section.items, language);

          if (items.length === 0) return null;

          const ListTag = section.numbered ? "ol" : "ul";

          return (
            <section
              className="detail-card"
              key={section.title}
            >
              <div className="detail-card-heading">
                <span aria-hidden="true">
                  {section.icon}
                </span>

                <h2>{section.title}</h2>
              </div>

              <ListTag
                className={
                  section.numbered
                    ? "scheme-steps"
                    : "scheme-detail-list"
                }
              >
                {items.map((item, index) => (
                  <li key={`${section.title}-${index}`}>
                    {item}
                  </li>
                ))}
              </ListTag>
            </section>
          );
        })}
      </div>

      {s.officialSource && (
        <div className="official-source">
          <div>
            <span className="eyebrow">
              OFFICIAL INFORMATION
            </span>

            <h3>Verify the latest details</h3>

            <p>
              Scheme rules, eligibility and application
              requirements may change. Always verify the
              latest information using the official source.
            </p>
          </div>

          <a
            className="btn primary"
            href={s.officialSource}
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit official source ↗
          </a>
        </div>
      )}
    </div>
  );
}
