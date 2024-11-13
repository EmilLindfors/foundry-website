// components/ui/button.tsx
import * as React from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Shared styles object that both buttons will use
const styles = {
  variants: {
    primary: 'bg-primary-500 hover:bg-primary-600 dark:bg-primary-400 dark:hover:bg-primary-300 text-white shadow-sm',
    secondary: 'bg-secondary-500 hover:bg-secondary-600 dark:bg-secondary-400 dark:hover:bg-secondary-300 text-white shadow-sm',
    outline: 'border border-light dark:border-dark bg-transparent hover:bg-light-surface dark:hover:bg-dark-surface text-light-primary dark:text-dark-primary',
    ghost: 'hover:bg-light-surface dark:hover:bg-dark-surface text-light-primary dark:text-dark-primary',
    link: 'text-primary-600 dark:text-primary-400 hover:underline underline-offset-4'
  },
  sizes: {
    sm: {
      button: 'h-9 text-sm',
      padding: 'px-3',
      icon: 'h-4 w-4'
    },
    md: {
      button: 'h-10',
      padding: 'px-4',
      icon: 'h-5 w-5'
    },
    lg: {
      button: 'h-11 text-lg',
      padding: 'px-6',
      icon: 'h-5 w-5'
    }
  },
  base: 'inline-flex items-center justify-center rounded-layout font-medium transition-colors duration-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 dark:focus-visible:ring-primary-400/50 disabled:opacity-50 disabled:pointer-events-none'
};

// Button Props
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof styles.variants;
  size?: keyof typeof styles.sizes;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// Button Component
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  children,
  ...props
}, ref) => {
  const leftIconElement = leftIcon && React.cloneElement(
    leftIcon as React.ReactElement,
    {
      className: cn(
        styles.sizes[size].icon,
        'shrink-0',
        children ? 'mr-2' : '',
        (leftIcon as React.ReactElement).props.className
      )
    }
  );

  const rightIconElement = rightIcon && React.cloneElement(
    rightIcon as React.ReactElement,
    {
      className: cn(
        styles.sizes[size].icon,
        'shrink-0',
        children ? 'ml-2' : '',
        (rightIcon as React.ReactElement).props.className
      )
    }
  );

  return (
    <button
      className={cn(
        styles.base,
        styles.variants[variant],
        styles.sizes[size].button,
        styles.sizes[size].padding,
        className
      )}
      ref={ref}
      {...props}
    >
      {leftIconElement}
      {children}
      {rightIconElement}
    </button>
  );
});
Button.displayName = 'Button';

// LinkButton Props
interface LinkButtonProps extends Omit<LinkProps, 'className'> {
  variant?: keyof typeof styles.variants;
  size?: keyof typeof styles.sizes;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

// LinkButton Component
const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(({
  className,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  children,
  ...props
}, ref) => {
  const leftIconElement = leftIcon && React.cloneElement(
    leftIcon as React.ReactElement,
    {
      className: cn(
        styles.sizes[size].icon,
        'shrink-0',
        children ? 'mr-2' : '',
        (leftIcon as React.ReactElement).props.className
      )
    }
  );

  const rightIconElement = rightIcon && React.cloneElement(
    rightIcon as React.ReactElement,
    {
      className: cn(
        styles.sizes[size].icon,
        'shrink-0',
        children ? 'ml-2' : '',
        (rightIcon as React.ReactElement).props.className
      )
    }
  );

  return (
    <Link
      className={cn(
        styles.base,
        styles.variants[variant],
        styles.sizes[size].button,
        styles.sizes[size].padding,
        className
      )}
      ref={ref}
      {...props}
    >
      {leftIconElement}
      {children}
      {rightIconElement}
    </Link>
  );
});
LinkButton.displayName = 'LinkButton';

export { Button, LinkButton };