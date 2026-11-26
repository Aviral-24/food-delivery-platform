export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-xl border border-border bg-surface-card p-5 shadow-xs ${className}`}>
      {children}
    </div>
  );
}