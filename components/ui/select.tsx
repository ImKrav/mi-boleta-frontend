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
          <label htmlFor={id} className="block text-sm font-medium text-foreground mb-2">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`
            w-full px-3 py-2.5 border rounded-lg shadow-sm text-base
            focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring
            bg-card text-foreground
            ${error ? 'border-destructive' : 'border-border'}
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
        {error && <p id={`${id}-error`} className="mt-2 text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
