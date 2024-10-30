import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'alt';
}

const Section = React.forwardRef<HTMLElement, SectionProps>(({
  className,
  variant = 'default',
  ...props
}, ref) => {
  return (
    <section
      ref={ref}
      className={cn(
        'py-16 md:py-24',
        variant === 'default' ? 'bg-light dark:bg-dark' : 'bg-light-surface dark:bg-dark-surface',
        className
      )}
      {...props}
    />
  );
});
Section.displayName = 'Section';

export { Section };