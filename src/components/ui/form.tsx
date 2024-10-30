import * as React from 'react';
import { cn } from '@/lib/utils';

const FormField = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-2', className)} {...props} />
  )
);
FormField.displayName = 'FormField';

const FormLabel = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'text-sm font-medium text-light-primary dark:text-dark-primary',
        className
      )}
      {...props}
    />
  )
);
FormLabel.displayName = 'FormLabel';

const FormControl = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mt-2', className)}
      {...props}
    />
  )
);
FormControl.displayName = 'FormControl';

export { FormField, FormLabel, FormControl };