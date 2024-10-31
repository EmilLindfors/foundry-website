import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md';
}

const Tag = React.forwardRef<HTMLSpanElement, TagProps>(({
  className,
  variant = 'default',
  size = 'sm',
  ...props
}, ref) => {
  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full font-medium transition-colors',
        size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1',
        variant === 'default' ? 
          'bg-secondary-100 dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100' :
          'border border-secondary-200 dark:border-secondary-700',
        className
      )}
      {...props}
    />
  );
});
Tag.displayName = 'Tag';

export { Tag };

export default Tag;