import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(({
  className,
  icon,
  title,
  description,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'p-6 rounded-layout bg-light-surface dark:bg-dark-surface',
        'border border-light dark:border-dark',
        'transition-theme duration-theme',
        className
      )}
      {...props}
    >
      {icon && (
        <div className="mb-4 text-primary-500 dark:text-primary-400">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-light-secondary dark:text-dark-secondary">{description}</p>
    </div>
  );
});
FeatureCard.displayName = 'FeatureCard';

export { FeatureCard };