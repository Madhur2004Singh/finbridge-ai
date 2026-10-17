import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../stores/auth.store";
import client from "../../api/client";
import { surveyApi } from "../../api/index";
import ErrorMessage from "../../components/ui/ErrorMessage";

const STATUS_LABEL = {
  not_started: "Not started",
  partial: "Partially completed",
  complete: "Completed",
};

const display = (value) =>
  !value || value === "not_collected"
    ? "Not collected"
    : String(value).replace(/_/g, " ");

export default function Profile() {
  const { u, updateUser } = useAuth();
  const [f, setF] = useState({ ...u });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState("not_started");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await surveyApi.get();
        if (mounted) {
          setProfile(data.profile || null);
          setStatus(data.status || "not_started");
        }
      } catch {
        // non-fatal — profile still editable
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const update = (key, value) => setF((prev) => ({ ...prev, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      setMessage("");
      const { data } = await client.patch("/users/profile", f);
      const updatedUser = data.user || f;
      updateUser(updatedUser);
      setF(updatedUser);
      setMessage("Profile updated successfully.");
    } catch (e) {
      setError(e.response?.data?.message || "Unable to update your profile.");
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
          <p>Keep your basic information updated so FinBridge can provide more relevant educational content and scheme recommendations.</p>
        </div>
        <div className="profile-avatar-large">{(u?.name || "U").charAt(0).toUpperCase()}</div>
      </section>

      <section className="profile-preview">
        <div className="section-heading">
          <div>
            <span className="eyebrow">SURVEY PROFILE</span>
            <h2>Generated financial profile</h2>
          </div>
          <span className={`badge status-${status}`}>{STATUS_LABEL[status]}</span>
        </div>
        {profile ? (
          <div className="preview-grid">
            <div><span>Age group</span><strong>{display(profile.demographics?.ageGroup)}</strong></div>
            <div><span>Occupation</span><strong>{display(profile.demographics?.occupation)}</strong></div>
            <div><span>State</span><strong>{display(profile.demographics?.state)}</strong></div>
            <div><span>City</span><strong>{display(profile.demographics?.city)}</strong></div>
            <div><span>Income</span><strong>{display(profile.financial?.incomeRange)}</strong></div>
            <div><span>Savings habit</span><strong>{display(profile.financial?.savingsHabit)}</strong></div>
            <div><span>Spending</span><strong>{display(profile.financial?.expenditurePattern)}</strong></div>
            <div><span>UPI usage</span><strong>{display(profile.literacy?.upiUsage)}</strong></div>
            <div><span>Digital awareness</span><strong>{display(profile.literacy?.digitalPaymentAwareness)}</strong></div>
            <div><span>Financial security</span><strong>{display(profile.literacy?.financialSecurityKnowledge)}</strong></div>
            <div><span>Risk preference</span><strong>{display(profile.riskPreference)}</strong></div>
            <div><span>Needs</span><strong>{(profile.needs || []).map(display).join(", ") || "Not collected"}</strong></div>
          </div>
        ) : (
          <p className="muted">You haven't completed the survey yet. Your generated profile will appear here.</p>
        )}
        <div style={{ marginTop: 16 }}>
          <NavLink to="/survey" className="btn secondary">
            {status === "not_started" ? "Take the survey →" : "Update survey responses →"}
          </NavLink>
        </div>
      </section>

      <form className="profile-form" onSubmit={submit}>
        <div className="profile-section">
          <div className="profile-section-heading">
            <span>👤</span>
            <div><h2>Personal information</h2><p>Basic information about you.</p></div>
          </div>
          <div className="form-grid">
            <label className="field">
              <span>Name</span>
              <input className="input" value={f.name || ""} onChange={(e) => update("name", e.target.value)} />
            </label>
            <label className="field">
              <span>Email</span>
              <input className="input" value={f.email || ""} disabled />
            </label>
            <label className="field">
              <span>State</span>
              <input className="input" placeholder="e.g. Karnataka" value={f.state || ""} onChange={(e) => update("state", e.target.value)} />
            </label>
          </div>
        </div>

        <div className="profile-section">
          <div className="profile-section-heading">
            <span>📊</span>
            <div><h2>Financial profile</h2><p>This information helps provide more relevant recommendations.</p></div>
          </div>
          <div className="form-grid">
            <label className="field">
              <span>Age group</span>
              <select className="input" value={f.ageGroup || ""} onChange={(e) => update("ageGroup", e.target.value)}>
                <option value="">Select age group</option>
                {["18-25","26-40","41-60","60+"].map((x) => <option key={x}>{x}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Occupation</span>
              <select className="input" value={f.occupation || ""} onChange={(e) => update("occupation", e.target.value)}>
                <option value="">Select occupation</option>
                {["student","salaried","small_business","farmer","daily_wage","homemaker","senior_citizen","other"].map((x) => <option key={x}>{x}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Income range</span>
              <select className="input" value={f.incomeRange || ""} onChange={(e) => update("incomeRange", e.target.value)}>
                <option value="">Select income range</option>
                {["below_15000","15000_30000","30000_60000","above_60000"].map((x) => <option key={x}>{x}</option>)}
              </select>
            </label>
          </div>
        </div>

        <ErrorMessage message={error} />
        {message && <div className="alert success-alert">✓ {message}</div>}
        <button className="btn primary" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
      </form>
    </div>
  );
}
