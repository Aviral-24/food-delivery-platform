/**
 * Accessible Button primitive.
 * @param {React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'secondary'|'ghost' }} props
 */
export function Button({ variant = 'primary', className = '', type = 'button', ...props }) {
  const styles = {
    primary: 'bg-brand text-white hover:bg-brand-hover disabled:opacity-60',
    secondary: 'bg-surface-card text-ink border border-border hover:bg-surface',
    ghost: 'text-ink-muted hover:text-ink hover:bg-surface-card',
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...props}
    />
  );
}