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
          <label htmlFor={id} className="block text-sm font-medium text-foreground mb-2">
            {label}
          </label>
        )}
        <input
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
        />
        {error && <p id={`${id}-error`} className="mt-2 text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
