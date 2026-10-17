import { Scheme } from "../models/Scheme.js";
import { toSlug } from "../utils/slug.js";
import { logger } from "../utils/logger.js";
import { firstSection, cleanCategory, cleanMarkdownEscapes } from "../utils/schemeText.js";
import schemeData from "../data/schemes.json" with { type: "json" };

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

export const seedSchemesIfEmpty = async () => {
  const count = await Scheme.countDocuments();
  if (count > 0) {
    logger.info(`Schemes already seeded (${count})`);
    return;
  }
  for (const s of schemeData) {
    // Source data cascades every section into the description; keep only the
    // relevant single section and clean the polluted category label.
    const description = firstSection(s.description);
    const eligibility = firstSection(s.eligibility);
    const documents = firstSection(s.documents);
    const steps = s.steps.map((x) => cleanMarkdownEscapes(x));

    await Scheme.create({
      slug: toSlug(s.name),
      name: { en: s.name, hi: s.name, kn: s.name },
      category: cleanCategory(s.category),
      description: { en: description, hi: description, kn: description },
      eligibility: [{ en: eligibility, hi: eligibility, kn: eligibility }],
      benefits: [{ en: description, hi: description, kn: description }],
      documentsRequired: [{ en: documents, hi: documents, kn: documents }],
      applicationSteps: steps.map((x) => ({ en: x, hi: x, kn: x })),
      officialSource: s.officialSource,
      targetOccupations: targetMap[s.name]?.occupation || [],
      targetAgeGroups: ["18-25", "26-40", "41-60", "60+"],
      targetIncomeRanges: ["below_15000", "15000_30000", "30000_60000", "above_60000"],
    });
  }
  logger.info(`Seeded ${schemeData.length} schemes`);
};

export const reseedSchemes = async () => {
  await Scheme.deleteMany({});
  await seedSchemesIfEmpty();
};
