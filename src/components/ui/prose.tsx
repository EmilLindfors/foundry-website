import * as React from 'react';
import { cn } from '@/lib/utils';

const Prose = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'prose prose-lg dark:prose-invert max-w-none',
        // Headings
        'prose-headings:text-text-light-primary prose-headings:dark:text-text-dark-primary',
        'prose-h1:text-4xl prose-h1:font-bold',
        'prose-h2:text-3xl prose-h2:font-semibold prose-h2:border-b prose-h2:border-light dark:prose-h2:border-dark prose-h2:pb-2',
        'prose-h3:text-2xl prose-h3:font-semibold',
        // Links
        'prose-a:text-primary-600 prose-a:dark:text-primary-400 prose-a:no-underline hover:prose-a:underline',
        // Lists
        'prose-ul:list-disc prose-ol:list-decimal',
        // Code
        'prose-code:bg-light-surface prose-code:dark:bg-dark-surface prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none',
        'prose-pre:bg-light-surface prose-pre:dark:bg-dark-surface prose-pre:border prose-pre:border-light dark:prose-pre:border-dark',
        // Images
        'prose-img:rounded-lg prose-img:border prose-img:border-light dark:prose-img:border-dark',
        // Quotes
        'prose-blockquote:border-l-4 prose-blockquote:border-primary-500 prose-blockquote:dark:border-primary-400 prose-blockquote:bg-light-surface prose-blockquote:dark:bg-dark-surface prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-lg',
        // Tables
        'prose-table:border prose-table:border-light dark:prose-table:border-dark',
        'prose-th:bg-light-surface dark:prose-th:bg-dark-surface prose-th:text-text-light-primary dark:prose-th:text-text-dark-primary',
        'prose-td:border prose-td:border-light dark:prose-td:border-dark',
        className
      )}
      {...props}
    />
  )
);
Prose.displayName = 'Prose';

export {Prose };