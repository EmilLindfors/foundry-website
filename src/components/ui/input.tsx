import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-layout border border-light dark:border-dark bg-light-surface dark:bg-dark-surface px-3 py-2',
          'text-light-primary dark:text-dark-primary',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-theme duration-theme',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };