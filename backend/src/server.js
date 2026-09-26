import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { db } from "./config.js";
import { auth, register, login } from "./auth.js";
import { User, Scheme, Expense } from "./models.js";
import schemeData from "./data/schemes.json" with { type: "json" };

const targetMap = {
  "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)": { occupation: ["farmer"] },
  "Pradhan Mantri Fasal Bima Yojana (PMFBY)": { occupation: ["farmer"] },
  "Kisan Credit Card (KCC)": { occupation: ["farmer"] },
  "Pradhan Mantri Kisan Maan-Dhan Yojana (PM-KMY)": { occupation: ["farmer"] },
  "Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)": {
    occupation: ["daily_wage", "farmer", "other"],
  },
  "Pradhan Mantri Shram Yogi Maan-dhan (PM-SYM) & e-Shram": {
    occupation: ["daily_wage", "other"],
  },
  "PM Street Vendor’s AtmaNirbhar Nidhi (PM SVANidhi)": {
    occupation: ["small_business"],
  },
  "Ayushman Bharat – Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)": {
    occupation: [
      "student",
      "salaried",
      "small_business",
      "farmer",
      "daily_wage",
      "homemaker",
      "senior_citizen",
      "other",
    ],
  },
  "Pradhan Mantri Suraksha Bima Yojana (PMSBY) & PMJJBY": {
    occupation: [
      "student",
      "salaried",
      "small_business",
      "farmer",
      "daily_wage",
      "homemaker",
      "other",
    ],
  },
  "Pradhan Mantri Awas Yojana – Gramin (PMAY-G)": {
    occupation: ["farmer", "daily_wage", "homemaker", "other"],
  },
};

const app = express();
app.use(helmet());
app.use(
  cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" })
);
app.use(express.json());

app.get("/api/health", (_, r) => r.json({ status: "ok" }));
app.post("/api/auth/register", register);
app.post("/api/auth/login", login);
app.get("/api/auth/me", auth, (q, r) => r.json({ user: q.user }));

app.patch("/api/users/profile", auth, async (q, r) => {
  const allowed = [
    "name",
    "ageGroup",
    "occupation",
    "incomeRange",
    "state",
    "language",
    "financialGoals",
    "riskPreference",
  ];
  const x = {};
  for (const k of allowed) {
    if (q.body[k] !== undefined) x[k] = q.body[k];
  }
  const u = await User.findByIdAndUpdate(q.user.id, x, {
    new: true,
    runValidators: true,
  }).select("-passwordHash");
  r.json({ user: u });
});

app.get("/api/schemes", async (q, r) => {
  const x = { active: true };
  if (q.query.category) x.category = q.query.category;
  if (q.query.occupation) x.targetOccupations = q.query.occupation;
  if (q.query.incomeRange) x.targetIncomeRanges = q.query.incomeRange;
  r.json({ schemes: await Scheme.find(x).sort({ createdAt: 1 }) });
});

app.get("/api/schemes/:slug", async (q, r) => {
  const s = await Scheme.findOne({ slug: q.params.slug, active: true });
  if (!s) return r.status(404).json({ message: "Scheme not found" });
  r.json({ scheme: s });
});

app.get("/api/schemes/recommendations", auth, async (q, r) => {
  const ss = await Scheme.find({ active: true });
  const out = ss
    .map((s) => {
      let score = 0,
        reasons = [];
      if (s.targetOccupations.includes(q.user.occupation)) {
        score += 4;
        reasons.push("occupation");
      }
      if (s.targetAgeGroups.includes(q.user.ageGroup)) {
        score += 2;
        reasons.push("age group");
      }
      if (s.targetIncomeRanges.includes(q.user.incomeRange)) {
        score += 2;
        reasons.push("income range");
      }
      return { scheme: s, score, reasons };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
  r.json({ recommendations: out });
});

app.get("/api/expenses", auth, async (q, r) => {
  const month = q.query.month;
  let filter = { userId: q.user.id };
  if (/^\d{4}-\d{2}$/.test(month || "")) {
    const a = new Date(month + "-01T00:00:00Z"),
      b = new Date(a);
    b.setUTCMonth(b.getUTCMonth() + 1);
    filter.date = { $gte: a, $lt: b };
  }
  const es = await Expense.find(filter).sort({ date: -1 });
  r.json({ expenses: es, total: es.reduce((s, e) => s + e.amount, 0) });
});

app.post("/api/expenses", auth, async (q, r) => {
  const { date, amount, category, note } = q.body;
  if (!date || Number(amount) <= 0) {
    return r.status(400).json({ message: "Date and positive amount required" });
  }
  r.status(201).json({
    expense: await Expense.create({
      userId: q.user.id,
      date: new Date(date),
      amount: Number(amount),
      category,
      note,
    }),
  });
});

app.delete("/api/expenses/:id", auth, async (q, r) => {
  await Expense.findOneAndDelete({ _id: q.params.id, userId: q.user.id });
  r.json({ message: "Deleted" });
});

app.get("/api/dashboard", auth, async (q, r) => {
  const [recent, all, recs] = await Promise.all([
    Expense.find({ userId: q.user.id }).sort({ date: -1 }).limit(5),
    Expense.find({ userId: q.user.id }),
    Scheme.find({ active: true }),
  ]);
  let rr = recs
    .map((s) => {
      let score = 0;
      if (s.targetOccupations.includes(q.user.occupation)) score += 4;
      if (s.targetAgeGroups.includes(q.user.ageGroup)) score += 2;
      if (s.targetIncomeRanges.includes(q.user.incomeRange)) score += 2;
      return { scheme: s, score };
    })
    .filter((x) => x.score)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  r.json({
    totalExpenses: all.reduce((s, e) => s + e.amount, 0),
    recentExpenses: recent,
    recommendations: rr,
  });
});

app.use((e, _, r, __) => r.status(500).json({ message: e.message || "Server error" }));

await db();
if ((await Scheme.countDocuments()) === 0) {
  for (const s of schemeData) {
    await Scheme.create({
      slug: s.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
      name: { en: s.name, hi: s.name, kn: s.name },
      category: s.category,
      description: { en: s.description, hi: s.description, kn: s.description },
      eligibility: [{ en: s.eligibility, hi: s.eligibility, kn: s.eligibility }],
      benefits: [{ en: s.description, hi: s.description, kn: s.description }],
      documentsRequired: [{ en: s.documents, hi: s.documents, kn: s.documents }],
      applicationSteps: s.steps.map((x) => ({ en: x, hi: x, kn: x })),
      officialSource: s.officialSource,
      targetOccupations: targetMap[s.name]?.occupation || [],
      targetAgeGroups: ["18-25", "26-40", "41-60", "60+"],
      targetIncomeRanges: [
        "below_15000",
        "15000_30000",
        "30000_60000",
        "above_60000",
      ],
    });
  }
}

console.log("Seeded/ready");
app.listen(process.env.PORT || 5000, () => console.log("API running"));