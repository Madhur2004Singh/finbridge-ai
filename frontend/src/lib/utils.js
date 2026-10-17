export function localized(value, language = "en") {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[language] || value.en || value.hi || value.kn || "";
}

export function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/** Scheme categories may arrive polluted ("Label | desc\n\n- **Description...") */
export function cleanCategory(category = "") {
  return String(category).split("\n")[0].split("|")[0].trim();
}

export function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
