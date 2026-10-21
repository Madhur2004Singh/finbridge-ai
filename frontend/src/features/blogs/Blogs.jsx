import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../stores/auth.store";
import { blogApi } from "../../api/index";
import { stripMarkdown } from "../../lib/markdown";
import { formatDate } from "../../lib/utils";
import Loading from "../../components/ui/Loading";
import ErrorMessage from "../../components/ui/ErrorMessage";
import EmptyState from "../../components/ui/EmptyState";

export default function Blogs() {
  const { u } = useAuth();
  const isAdmin = u?.role === "admin";
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await blogApi.list();
        if (mounted) setBlogs(data.blogs || []);
      } catch (e) {
        if (mounted) setError(e.response?.data?.message || "Unable to load blogs.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="content-page">
      <section className="page-hero blog-hero">
        <div>
          <span className="eyebrow">INSIGHTS & GUIDES</span>
          <h1>FinBridge Blog</h1>
          <p>Financial literacy articles and updates from the FinBridge team.</p>
        </div>
        <div className="hero-icon">📰</div>
      </section>

      {isAdmin && (
        <div className="blog-admin-bar">
          <span className="muted">You are signed in as an admin.</span>
          <NavLink to="/blogs/new" className="btn primary">
            + New blog
          </NavLink>
        </div>
      )}

      <ErrorMessage message={error} />

      {loading ? (
        <Loading text="Loading blogs..." />
      ) : blogs.length === 0 ? (
        <EmptyState icon="📰" title="No blogs yet" text="Check back soon for new articles." />
      ) : (
        <div className="blog-grid">
          {blogs.map((b) => (
            <NavLink to={`/blogs/${b.slug}`} className="blog-card" key={b._id}>
              <div className="blog-card-image">
                {b.image?.url ? (
                  <img src={b.image.url} alt={b.title} loading="lazy" />
                ) : (
                  <span>📝</span>
                )}
              </div>
              <div className="blog-card-body">
                {!b.published && <span className="badge status-partial">Draft</span>}
                <h2>{b.title}</h2>
                <p>{stripMarkdown(b.content).slice(0, 140)}…</p>
                <div className="blog-meta">
                  <span>{b.authorName || "FinBridge"}</span>
                  <span>{formatDate(b.createdAt)}</span>
                  <span>💬 {b.commentCount || 0}</span>
                </div>
              </div>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
