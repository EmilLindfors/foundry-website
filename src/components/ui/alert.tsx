import * as React from 'react';
import { cn } from '@/lib/utils';

const Alert = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        'rounded-layout border border-light dark:border-dark p-4 bg-light-surface dark:bg-dark-surface transition-theme duration-theme',
        className
      )}
      {...props}
    />
  )
);
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn('font-medium leading-none tracking-tight mb-2', className)}
      {...props}
    />
  )
);
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-sm text-light-secondary dark:text-dark-secondary', className)}
      {...props}
    />
  )
);
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };