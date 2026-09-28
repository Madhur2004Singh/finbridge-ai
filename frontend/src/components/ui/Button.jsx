import { cn } from "../../lib/utils";

export default function Button({
  variant = "primary",
  fullWidth = false,
  className,
  children,
  ...props
}) {
  return (
    <button
      className={cn(
        "btn",
        variant,
        fullWidth && "full-width",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
