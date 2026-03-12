export default function Card({ title, children, className = "" }) {
  return (
    <div className={`bg-panel-bg border border-border rounded-xl p-6 ${className}`}>
      {title && (
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
