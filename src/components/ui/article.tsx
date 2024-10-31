import React from 'react';
import { cn } from '@/lib/utils';

const Article = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <article
      ref={ref}
      className={cn('relative', className)}
      {...props}
    />
  )
);
Article.displayName = 'Article';

export { Article };