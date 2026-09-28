export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  INTERNAL: 500,
};

export const ALLOWED_PROFILE_FIELDS = [
  "name",
  "ageGroup",
  "occupation",
  "incomeRange",
  "state",
  "language",
  "financialGoals",
  "riskPreference",
];

export const VALID_OCCUPATIONS = [
  "student",
  "salaried",
  "small_business",
  "farmer",
  "daily_wage",
  "homemaker",
  "senior_citizen",
  "other",
];

export const VALID_AGE_GROUPS = ["18-25", "26-40", "41-60", "60+"];
export const VALID_INCOME_RANGES = [
  "below_15000",
  "15000_30000",
  "30000_60000",
  "above_60000",
];

export const EXPENSE_CATEGORIES = [
  "food",
  "travel",
  "bills",
  "shopping",
  "education",
  "health",
  "savings",
  "other",
];
