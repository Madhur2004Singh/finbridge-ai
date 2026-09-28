import mongoose from "mongoose";

const localizedString = new mongoose.Schema(
  { en: String, hi: String, kn: String },
  { _id: false }
);

const schemeSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: localizedString,
    category: { type: String, trim: true },
    targetOccupations: [{ type: String }],
    targetAgeGroups: [{ type: String }],
    targetIncomeRanges: [{ type: String }],
    description: localizedString,
    eligibility: [localizedString],
    benefits: [localizedString],
    documentsRequired: [localizedString],
    applicationSteps: [localizedString],
    officialSource: String,
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

schemeSchema.index({ slug: 1 }, { unique: true });
schemeSchema.index({ active: 1, category: 1 });
schemeSchema.index({ active: 1, targetOccupations: 1 });

export const Scheme = mongoose.model("Scheme", schemeSchema);
