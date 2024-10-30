// components/ui/button.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}, ref) => {
  const variants = {
    primary: 'bg-primary-500 hover:bg-primary-600 dark:bg-primary-400 dark:hover:bg-primary-300 text-white',
    secondary: 'bg-secondary-500 hover:bg-secondary-600 dark:bg-secondary-400 dark:hover:bg-secondary-300 text-white',
    outline: 'border border-light dark:border-dark bg-transparent hover:bg-light-surface dark:hover:bg-dark-surface text-light-primary dark:text-dark-primary'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={cn(
        'rounded-layout font-medium transition-theme duration-theme focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50',
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export { Button };