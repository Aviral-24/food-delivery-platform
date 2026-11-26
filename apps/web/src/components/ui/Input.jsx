import { forwardRef, useId } from 'react';

export const Input = forwardRef(function Input({ label, error, className = '', ...props }, ref) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`rounded-lg border bg-surface-card px-3 py-2 text-sm text-ink placeholder:text-ink-muted ${
          error ? 'border-red-500' : 'border-border'
        } ${className}`}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});