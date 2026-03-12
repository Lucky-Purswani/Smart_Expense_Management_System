export default function Button({
  children,
  type = "button",
  variant = "primary",
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  className = "",
}) {
  const base =
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-accent text-accent-text hover:bg-accent-hover",
    secondary:
      "bg-transparent text-text-secondary border border-border hover:text-text-primary hover:bg-hover-bg",
    danger:
      "bg-danger text-white hover:opacity-90",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${base} ${variants[variant] || variants.primary} ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
