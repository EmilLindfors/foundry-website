import * as React from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';

export interface FilterButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

const FilterButton = React.forwardRef<HTMLButtonElement, FilterButtonProps>(({
  className,
  active,
  ...props
}, ref) => {
  return (
    <Button
      ref={ref}
      variant={active ? 'secondary' : 'outline'}
      size="sm"
      className={cn(
        'rounded-full',
        className
      )}
      {...props}
    />
  );
});
FilterButton.displayName = 'FilterButton';

export { FilterButton };