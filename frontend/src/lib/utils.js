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
