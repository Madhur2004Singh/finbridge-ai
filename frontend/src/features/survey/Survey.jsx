import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../stores/auth.store";
import { surveyApi } from "../../api/index";
import { surveySchema, validateWith, SURVEY_OPTIONS } from "../../lib/schemas";
import Loading from "../../components/ui/Loading";
import ErrorMessage from "../../components/ui/ErrorMessage";

const OPTION_LABELS = {
  ageGroup: {
    "18-25": "18–25",
    "26-40": "26–40",
    "41-60": "41–60",
    "60+": "60+",
    other: "Other",
  },
  occupation: {
    student: "Student",
    salaried: "Salaried",
    small_business: "Small business",
    farmer: "Farmer",
    daily_wage: "Daily wage worker",
    homemaker: "Homemaker",
    senior_citizen: "Senior citizen",
    other: "Other",
  },
  incomeRange: {
    below_15000: "Below ₹15,000",
    "15000_30000": "₹15,000 – ₹30,000",
    "30000_60000": "₹30,000 – ₹60,000",
    above_60000: "Above ₹60,000",
  },
  savingsHabit: {
    regular: "Save regularly",
    occasional: "Save occasionally",
    rarely: "Rarely save",
    never: "Never save",
  },
  expenditurePattern: {
    balanced: "Balanced",
    spend_more: "Spend more than I earn",
    save_more: "Save more than I spend",
    unsure: "Not sure",
  },
  upiUsage: {
    daily: "Daily",
    weekly: "Weekly",
    rarely: "Rarely",
    never: "Never",
  },
  digitalPaymentAwareness: {
    full: "Fully aware",
    some: "Somewhat aware",
    basic: "Basic awareness",
    none: "Not aware",
  },
  financialSecurityKnowledge: {
    full: "Insurance + emergency fund",
    partial: "Partial knowledge",
    none: "No knowledge",
  },
  needs: {
    insurance: "Insurance",
    pension: "Pension",
    credit: "Credit / loan",
    govt_schemes: "Government schemes",
    investment: "Investment guidance",
    none: "None",
  },
  riskPreference: {
    low: "Low",
    medium: "Medium",
    high: "High",
  },
};

const GOAL_OPTIONS = [
  "emergency_fund",
  "education",
  "retirement",
  "buy_home",
  "start_business",
  "health",
  "debt_free",
  "travel",
];

const goalLabel = (g) =>
  g.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const label = (group, value) =>
  OPTION_LABELS[group]?.[value] || value?.replace(/_/g, " ") || "Not collected";

const EMPTY = {
  ageGroup: "",
  occupation: "",
  state: "",
  city: "",
  incomeRange: "",
  savingsHabit: "",
  expenditurePattern: "",
  upiUsage: "",
  digitalPaymentAwareness: "",
  financialSecurityKnowledge: "",
  needs: [],
  goals: [],
  riskPreference: "",
};

const STATUS_LABEL = {
  not_started: "Not started",
  partial: "Partially completed",
  complete: "Completed",
};

export default function Survey() {
  const { t } = useTranslation();
  const { u } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState("not_started");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await surveyApi.get();
        if (!mounted) return;
        if (data.responses) {
          setForm({
            ...EMPTY,
            ...Object.fromEntries(
              Object.entries(data.responses).filter(([k]) => k in EMPTY)
            ),
            needs: data.responses.needs || [],
            goals: data.responses.goals || [],
          });
        }
        setStatus(data.status || "not_started");
        setProfile(data.profile || null);
      } catch (e) {
        if (mounted) setError(e.response?.data?.message || "Unable to load your survey.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const toggleArray = (key, value) => {
    setForm((prev) => {
      const current = prev[key] || [];
      let next;
      if (value === "none") {
        next = current.includes("none") ? [] : ["none"];
      } else {
        const withoutNone = current.filter((x) => x !== "none");
        next = withoutNone.includes(value)
          ? withoutNone.filter((x) => x !== value)
          : [...withoutNone, value];
      }
      return { ...prev, [key]: next };
    });
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const toggleGoal = (goal) => {
    setForm((prev) => {
      const current = prev.goals || [];
      return {
        ...prev,
        goals: current.includes(goal)
          ? current.filter((g) => g !== goal)
          : [...current, goal],
      };
    });
  };

  const payloadFromForm = () => {
    const payload = {};
    for (const key of Object.keys(EMPTY)) {
      const value = form[key];
      if (Array.isArray(value)) {
        if (value.length) payload[key] = value;
      } else if (value !== "" && value !== undefined) {
        payload[key] = typeof value === "string" ? value.trim() : value;
      }
    }
    return payload;
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = payloadFromForm();
    const { data: valid, fieldErrors: errs } = validateWith(surveySchema, payload);
    if (!valid) {
      setFieldErrors(errs);
      setError("Please fix the highlighted fields before saving.");
      setMessage("");
      return;
    }
    try {
      setSaving(true);
      setError("");
      setMessage("");
      setFieldErrors({});
      const { data } = await surveyApi.submit(payload);
      setStatus(data.status);
      setProfile(data.profile);
      setMessage("Survey saved. Your financial profile has been generated.");
    } catch (e2) {
      const apiErrors = e2.response?.data?.errors;
      if (Array.isArray(apiErrors) && apiErrors.length) {
        setFieldErrors(
          Object.fromEntries(apiErrors.map((x) => [x.field, x.message]))
        );
      }
      setError(e2.response?.data?.message || "Unable to save your survey.");
    } finally {
      setSaving(false);
    }
  };

  const regenerate = async () => {
    try {
      setRegenerating(true);
      setError("");
      setMessage("");
      const { data } = await surveyApi.regenerateProfile();
      setProfile(data.profile);
      setStatus(data.status);
      setMessage("Profile regenerated from your saved responses.");
    } catch (e) {
      setError(e.response?.data?.message || "Unable to regenerate your profile.");
    } finally {
      setRegenerating(false);
    }
  };

  const selectField = (group, key, placeholder) => (
    <label className="field">
      <span>{placeholder}</span>
      <select className="input" value={form[key]} onChange={(e) => set(key, e.target.value)}>
        <option value="">Select…</option>
        {SURVEY_OPTIONS[group].map((opt) => (
          <option key={opt} value={opt}>
            {OPTION_LABELS[group][opt]}
          </option>
        ))}
      </select>
      {fieldErrors[key] && <small className="field-error">{fieldErrors[key]}</small>}
    </label>
  );

  const chipGroup = (group, key) => (
    <div className="chip-group">
      {SURVEY_OPTIONS[group].map((opt) => {
        const active = (form[key] || []).includes(opt);
        return (
          <button
            type="button"
            key={opt}
            className={`chip ${active ? "active" : ""}`}
            onClick={() => toggleArray(key, opt)}
          >
            {OPTION_LABELS[group][opt]}
          </button>
        );
      })}
    </div>
  );

  if (loading) return <Loading text="Loading your survey..." />;

  return (
    <div className="content-page">
      <section className="page-hero survey-hero">
        <div>
          <span className="eyebrow">PERSONALIZE YOUR EXPERIENCE</span>
          <h1>Financial Profile Survey</h1>
          <p>
            Your answers generate a financial profile that personalizes scheme
            recommendations. They are stored privately against your account
            {u?.name ? `, ${u.name.split(" ")[0]}` : ""}.
          </p>
        </div>
        <div className="hero-icon">📝</div>
      </section>

      <div className={`survey-status ${status}`}>
        <span className="status-dot" />
        <strong>Profile status:</strong> {STATUS_LABEL[status] || status}
        {status !== "complete" && (
          <span className="muted"> — answer all questions for the best recommendations.</span>
        )}
      </div>

      <ErrorMessage message={error} />
      {message && <div className="alert success-alert">✓ {message}</div>}

      <form className="profile-form" onSubmit={submit}>
        <div className="profile-section">
          <div className="profile-section-heading">
            <span>👤</span>
            <div>
              <h2>Demographics</h2>
              <p>Basic information about you and where you live.</p>
            </div>
          </div>
          <div className="form-grid">
            {selectField("ageGroup", "ageGroup", "Age group")}
            {selectField("occupation", "occupation", "Occupation")}
            <label className="field">
              <span>State</span>
              <input
                className="input"
                placeholder="e.g. Karnataka"
                value={form.state}
                onChange={(e) => set("state", e.target.value)}
              />
              {fieldErrors.state && <small className="field-error">{fieldErrors.state}</small>}
            </label>
            <label className="field">
              <span>City / District</span>
              <input
                className="input"
                placeholder="e.g. Mysuru"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
              />
              {fieldErrors.city && <small className="field-error">{fieldErrors.city}</small>}
            </label>
          </div>
        </div>

        <div className="profile-section">
          <div className="profile-section-heading">
            <span>💰</span>
            <div>
              <h2>Financial situation</h2>
              <p>Income, savings habits and how you manage your money.</p>
            </div>
          </div>
          <div className="form-grid">
            {selectField("incomeRange", "incomeRange", "Monthly income range")}
            {selectField("savingsHabit", "savingsHabit", "Savings habit")}
            {selectField("expenditurePattern", "expenditurePattern", "Expenditure pattern")}
            {selectField("riskPreference", "riskPreference", "Risk preference")}
          </div>
        </div>

        <div className="profile-section">
          <div className="profile-section-heading">
            <span>📱</span>
            <div>
              <h2>Digital financial literacy</h2>
              <p>Your awareness of UPI, digital payments and financial security.</p>
            </div>
          </div>
          <div className="form-grid">
            {selectField("upiUsage", "upiUsage", "How often do you use UPI?")}
            {selectField(
              "digitalPaymentAwareness",
              "digitalPaymentAwareness",
              "Digital payment awareness"
            )}
            {selectField(
              "financialSecurityKnowledge",
              "financialSecurityKnowledge",
              "Knowledge of insurance & emergency funds"
            )}
          </div>
        </div>

        <div className="profile-section">
          <div className="profile-section-heading">
            <span>🎯</span>
            <div>
              <h2>Financial needs</h2>
              <p>What kind of support would help you most?</p>
            </div>
          </div>
          {chipGroup("needs", "needs")}
          {fieldErrors.needs && <small className="field-error">{fieldErrors.needs}</small>}

          <div className="profile-section-heading" style={{ marginTop: 24 }}>
            <span>🏁</span>
            <div>
              <h2>Financial goals</h2>
              <p>Select the goals that matter to you.</p>
            </div>
          </div>
          <div className="chip-group">
            {GOAL_OPTIONS.map((goal) => {
              const active = (form.goals || []).includes(goal);
              return (
                <button
                  type="button"
                  key={goal}
                  className={`chip ${active ? "active" : ""}`}
                  onClick={() => toggleGoal(goal)}
                >
                  {goalLabel(goal)}
                </button>
              );
            })}
          </div>
          {fieldErrors.goals && <small className="field-error">{fieldErrors.goals}</small>}
        </div>

        <div className="survey-actions">
          <button className="btn primary" disabled={saving}>
            {saving ? "Saving..." : "Save & generate profile"}
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={regenerate}
            disabled={regenerating || status === "not_started"}
            title="Rebuild the profile from your last saved answers"
          >
            {regenerating ? "Regenerating..." : "Regenerate profile"}
          </button>
        </div>
      </form>

      {profile && (
        <section className="profile-preview">
          <div className="section-heading">
            <div>
              <span className="eyebrow">GENERATED PROFILE</span>
              <h2>Your financial profile</h2>
            </div>
            <span className={`badge status-${profile.completionStatus}`}>
              {STATUS_LABEL[profile.completionStatus]}
            </span>
          </div>
          <div className="preview-grid">
            <div>
              <span>Age group</span>
              <strong>{label("ageGroup", profile.demographics?.ageGroup)}</strong>
            </div>
            <div>
              <span>Occupation</span>
              <strong>{label("occupation", profile.demographics?.occupation)}</strong>
            </div>
            <div>
              <span>Location</span>
              <strong>
                {profile.demographics?.city !== "not_collected"
                  ? profile.demographics.city
                  : label(null, profile.demographics?.state)}
              </strong>
            </div>
            <div>
              <span>Income</span>
              <strong>{label("incomeRange", profile.financial?.incomeRange)}</strong>
            </div>
            <div>
              <span>Savings</span>
              <strong>{label("savingsHabit", profile.financial?.savingsHabit)}</strong>
            </div>
            <div>
              <span>Spending</span>
              <strong>
                {label("expenditurePattern", profile.financial?.expenditurePattern)}
              </strong>
            </div>
            <div>
              <span>UPI usage</span>
              <strong>{label("upiUsage", profile.literacy?.upiUsage)}</strong>
            </div>
            <div>
              <span>Digital awareness</span>
              <strong>
                {label("digitalPaymentAwareness", profile.literacy?.digitalPaymentAwareness)}
              </strong>
            </div>
            <div>
              <span>Financial security</span>
              <strong>
                {label(
                  "financialSecurityKnowledge",
                  profile.literacy?.financialSecurityKnowledge
                )}
              </strong>
            </div>
            <div>
              <span>Risk preference</span>
              <strong>{label("riskPreference", profile.riskPreference)}</strong>
            </div>
          </div>
          <div className="preview-lists">
            <div>
              <span>Needs</span>
              <div className="chip-group">
                {(profile.needs || []).length ? (
                  profile.needs.map((n) => (
                    <span className="chip active static" key={n}>
                      {label("needs", n)}
                    </span>
                  ))
                ) : (
                  <span className="muted">Not collected</span>
                )}
              </div>
            </div>
            <div>
              <span>Goals</span>
              <div className="chip-group">
                {(profile.goals || []).length ? (
                  profile.goals.map((g) => (
                    <span className="chip active static" key={g}>
                      {goalLabel(g)}
                    </span>
                  ))
                ) : (
                  <span className="muted">Not collected</span>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
