import { Scheme } from "../models/Scheme.js";
import { toSlug } from "../utils/slug.js";
import { logger } from "../utils/logger.js";
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
    await Scheme.create({
      slug: toSlug(s.name),
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
      targetIncomeRanges: ["below_15000", "15000_30000", "30000_60000", "above_60000"],
    });
  }
  logger.info(`Seeded ${schemeData.length} schemes`);
};

export const reseedSchemes = async () => {
  await Scheme.deleteMany({});
  await seedSchemesIfEmpty();
};
