// components/ui/select.tsx

import { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string | null;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-semibold text-foreground mb-2">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`
            w-full px-3.5 py-2.5 border rounded-lg text-base
            focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring
            bg-card text-foreground transition-all duration-200
            ${error ? 'border-destructive focus:ring-destructive/30' : 'border-border'}
            ${className}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p id={`${id}-error`} className="mt-2 text-sm text-destructive font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
