import * as React from 'react';
import { cn } from '@/lib/utils';
import * as Select from '@radix-ui/react-select';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface SelectProps extends Select.SelectProps {
  options: { value: string; label: string }[];
  className?: string; // Add className to the interface
}

const SelectComponent = React.forwardRef<HTMLButtonElement, SelectProps>(
  ({ className, options, ...props }, ref) => {
    return (
      <Select.Root {...props}>
        <Select.Trigger
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-layout border border-light dark:border-dark bg-light-surface dark:bg-dark-surface px-3 py-2',
            'text-light-primary dark:text-dark-primary',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-theme duration-theme',
            className
          )}
        >
          <Select.Value />
          <Select.Icon className="ml-2">
            <ChevronDown />
          </Select.Icon>
        </Select.Trigger>
        <Select.Content className="bg-light-surface dark:bg-dark-surface rounded-layout shadow-lg">
          <Select.ScrollUpButton className="flex items-center justify-center h-6 bg-light-surface dark:bg-dark-surface">
            <ChevronUp />
          </Select.ScrollUpButton>
          <Select.Viewport className="p-2">
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className={cn(
                  'flex items-center px-3 py-2 rounded-layout cursor-pointer',
                  'text-light-primary dark:text-dark-primary',
                  'focus:bg-primary-500 focus:text-white dark:focus:bg-primary-400'
                )}
              >
                <Select.ItemText>{option.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton className="flex items-center justify-center h-6 bg-light-surface dark:bg-dark-surface">
            <ChevronDown />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Root>
    );
  }
);
SelectComponent.displayName = 'SelectComponent';

export { SelectComponent as Select };
