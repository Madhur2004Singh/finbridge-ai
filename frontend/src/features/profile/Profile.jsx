import { useState } from "react";
import { useAuth } from "../../stores/auth.store";
import client from "../../api/client";
import ErrorMessage from "../../components/ui/ErrorMessage";

export default function Profile() {
  const { u, updateUser } = useAuth();
  const [f, setF] = useState({ ...u });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
