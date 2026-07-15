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
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2";

  const variants = {
    primary: "bg-accent text-accent-text hover:bg-accent-hover active:scale-[0.98]",
    secondary:
      "bg-hover-bg text-text-secondary hover:text-text-primary hover:bg-border transition-colors",
    danger:
      "bg-danger/10 text-danger hover:bg-danger/20 transition-colors",
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
