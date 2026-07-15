export default function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  id,
  name,
  autoFocus = false,
  maxLength,
  className = "",
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-text-secondary">
          {label}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoFocus={autoFocus}
        maxLength={maxLength}
        className="w-full bg-input-bg border border-border rounded-lg px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all placeholder:text-text-muted disabled:opacity-50"
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
