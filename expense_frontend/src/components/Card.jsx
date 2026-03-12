// Reusable Card component — server-compatible (no "use client")

export default function Card({ title, icon, children, className = "" }) {
  return (
    <div className={`bg-panel-bg border border-border-main rounded-xl p-5 ${className}`}>
      {(title || icon) && (
        <div className="flex items-center gap-2 mb-4">
          {icon && <span className="text-text-sub">{icon}</span>}
          {title && <h3 className="text-sm font-semibold text-text-sub uppercase tracking-wide">{title}</h3>}
        </div>
      )}
      {children}
    </div>
  );
}
