
import { Scheme } from "../models/Scheme.js";
import { toSlug } from "../utils/slug.js";
import { logger } from "../utils/logger.js";
import schemeData from "../data/schemes.json" with { type: "json" };

const targetMap = {
  "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)": ["farmer"],
  "Pradhan Mantri Fasal Bima Yojana (PMFBY)": ["farmer"],
  "Kisan Credit Card (KCC)": ["farmer"],
  "Pradhan Mantri Kisan Maan-Dhan Yojana (PM-KMY)": ["farmer"],
  "Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)": [
    "daily_wage", "farmer", "other",
  ],
  "Pradhan Mantri Shram Yogi Maan-dhan (PM-SYM) & e-Shram": [
    "daily_wage", "other",
  ],
  "PM Street Vendor’s AtmaNirbhar Nidhi (PM SVANidhi)": [
    "small_business",
  ],
  "Ayushman Bharat – Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)": [
    "student", "salaried", "small_business", "farmer",
    "daily_wage", "homemaker", "senior_citizen", "other",
  ],
  "Pradhan Mantri Suraksha Bima Yojana (PMSBY) & PMJJBY": [
    "student", "salaried", "small_business", "farmer",
    "daily_wage", "homemaker", "other",
  ],
  "Pradhan Mantri Awas Yojana – Gramin (PMAY-G)": [
    "farmer", "daily_wage", "homemaker", "other",
  ],
};

function cleanText(value = "") {
  return String(value)
    .replace(/\r/g, "")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$1 ($2)")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractSection(source, label, nextLabels) {
  const heading = new RegExp(
    `(?:^|\\n)\\s*[-*]?\\s*\\*\\*${label}\\*\\*\\s*`,
    "i"
  );

  const match = heading.exec(source);
  if (!match) return "";

  const start = match.index + match[0].length;
  const remaining = source.slice(start);

  const nextHeading = new RegExp(
    `(?:^|\\n)\\s*[-*]?\\s*\\*\\*(?:${nextLabels.join("|")})\\*\\*\\s*`,
    "i"
  );

  const next = nextHeading.exec(remaining);
  return cleanText(next ? remaining.slice(0, next.index) : remaining);
}

function localized(value) {
  const text = cleanText(value);
  return { en: text, hi: text, kn: text };
}

function toList(value) {
  if (!value) return [];
  const values = Array.isArray(value) ? value : [value];

  return values.map(cleanText).filter(Boolean);
}

function normalizeScheme(s) {
  // The category field currently contains the original Markdown source.
  const source = String(s.category || "").replace(/\r/g, "");

  const categoryHeader = source.split(/\n/)[0];
  const category = cleanText(categoryHeader.split("|")[0]);

  const description = extractSection(source,
    "Description & Key Benefits:",
    ["Eligibility:", "Documents Required:", "Steps to Apply:", "Official Link:"]
  );

  const eligibility = extractSection(source,
    "Eligibility:",
    ["Documents Required:", "Steps to Apply:", "Official Link:"]
  );

  const documents = extractSection(source,
    "Documents Required:",
    ["Steps to Apply:", "Official Link:"]
  );

  // The source JSON already stores application instructions as an array.
  const applicationSteps = toList(s.steps);

  return {
    slug: toSlug(s.name),
    name: localized(s.name),
    category,
    description: localized(description || s.description),

    eligibility: toList(eligibility || s.eligibility).map(localized),

    // The source contains one benefits/description section, not two
    // independent sections. Reuse its clean summary for benefits.
    benefits: description ? [localized(description)] : [],

    documentsRequired: toList(documents || s.documents).map(localized),
    applicationSteps: applicationSteps.map(localized),

    officialSource: s.officialSource,
    targetOccupations: targetMap[s.name] || [],
    targetAgeGroups: ["18-25", "26-40", "41-60", "60+"],
    targetIncomeRanges: [
      "below_15000",
      "15000_30000",
      "30000_60000",
      "above_60000",
    ],
    active: true,
  };
}

export const seedSchemesIfEmpty = async () => {
  const count = await Scheme.countDocuments();

  if (count > 0) {
    logger.info(`Schemes already seeded (${count})`);
    return;
  }

  await Scheme.insertMany(schemeData.map(normalizeScheme));
  logger.info(`Seeded ${schemeData.length} schemes`);
};

export const reseedSchemes = async () => {
  await Scheme.deleteMany({});
  await seedSchemesIfEmpty();
};
