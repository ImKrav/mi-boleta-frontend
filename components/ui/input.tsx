// components/ui/input.tsx

import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-semibold text-foreground mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`
            w-full px-3.5 py-2.5 border rounded-lg text-base
            focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring
            bg-card text-foreground transition-all duration-200
            placeholder:text-muted-foreground/60
            ${error ? 'border-destructive focus:ring-destructive/30' : 'border-border'}
            ${className}
          `}
          {...props}
        />
        {error && <p id={`${id}-error`} className="mt-2 text-sm text-destructive font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
