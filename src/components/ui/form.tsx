import * as React from 'react';
import { cn } from '@/lib/utils';
import * as Form from '@radix-ui/react-form';
import { Button, ButtonProps } from './button';
import { TextArea } from './textarea';
import { Select } from './select';
import { ChevronRight } from 'lucide-react';

const FormRoot = ({ className, ...props }: React.HTMLAttributes<HTMLFormElement>) => (
  <Form.Root className={cn(className)} {...props} />
);
FormRoot.displayName = 'FormRoot';

const FormField = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { name: string }>(
  ({ className, name, ...props }, ref) => (
    <Form.Field ref={ref} name={name} className={cn('space-y-2', className)} {...props} />
  )
);
FormField.displayName = 'FormField';

const FormLabel = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <Form.Label
      ref={ref}
      className={cn(
        'text-sm font-bold text-light-primary dark:text-dark-primary',
        className
      )}
      {...props}
    />
  )
);
FormLabel.displayName = 'FormLabel';

const FormControl = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <Form.Control
    className={cn('mt-2', className)}
    {...props}
    asChild
  />
);
FormControl.displayName = 'FormControl';

const FormMessage = ({ className, ...props }: Form.FormMessageProps) => (
  <Form.Message className={cn('text-red-500 text-sm', className)} {...props} />
);
FormMessage.displayName = 'FormMessage';

const FormSubmit = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, rightIcon, ...props }, ref) => (
    <Form.Submit asChild>
      <Button ref={ref} className={cn("group",className)} rightIcon={rightIcon ? rightIcon : <ChevronRight className='group-hover:animate-ping duration-500'/>} {...props} />
    </Form.Submit>
  )
);
FormSubmit.displayName = 'FormSubmit';

export { FormRoot, FormField, FormLabel, FormControl, FormMessage, FormSubmit, TextArea, Select };