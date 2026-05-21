// components/ui/button.tsx

import { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const variants = {
  primary: 'bg-primary text-on-primary hover:bg-primary/90 focus:ring-primary/30 shadow-sm hover:shadow',
  secondary: 'bg-secondary text-on-secondary hover:bg-secondary/90 focus:ring-secondary/30 shadow-sm hover:shadow',
  danger: 'bg-destructive text-on-destructive hover:bg-destructive/90 focus:ring-destructive/30 shadow-sm hover:shadow',
  ghost: 'bg-transparent text-foreground hover:bg-muted focus:ring-muted-foreground/30',
  outline: 'bg-transparent text-foreground border border-border hover:bg-muted focus:ring-muted-foreground/30',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, children, disabled, className = '', ...props }, ref) => {
    return (
      <button
        type="button"
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center gap-2 font-medium rounded-lg
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
          ${variants[variant]} ${sizes[size]} ${className}
        `}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
