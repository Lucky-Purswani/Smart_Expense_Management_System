export default function Card({ title, children, className = "" }) {
  return (
    <div className={`bg-panel-bg border border-border rounded-xl p-5 sm:p-6 ${className}`}>
      {title && (
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
