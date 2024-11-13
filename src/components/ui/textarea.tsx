import * as React from 'react';
import { cn } from '@/lib/utils';
import * as Form from '@radix-ui/react-form';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, ...props }, ref) => {
    return (
      <Form.Control asChild>
        <textarea
          className={cn(
            'flex h-32 w-full rounded-layout border border-light dark:border-dark bg-light-surface dark:bg-dark-surface px-3 py-2',
            'text-light-primary dark:text-dark-primary',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-theme duration-theme',
            className
          )}
          ref={ref}
          {...props}
        />
      </Form.Control>
    );
  }
);
TextArea.displayName = 'TextArea';

export { TextArea };
