import { cn } from "../../lib/utils";

export function Input({ className, ...props }) {
  return <input className={cn("input", className)} {...props} />;
}

export function Select({ className, children, ...props }) {
  return (
    <select className={cn("input", className)} {...props}>
      {children}
    </select>
  );
}

export function Field({ label, children, error }) {
  return (
    <label className="field">
      {label && <span>{label}</span>}
      {children}
      {error && <small className="text-red-600 text-xs mt-1">{error}</small>}
    </label>
  );
}
