// Select.tsx — styled native select (keeps native a11y + mobile pickers).
import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { invalid, className, children, ...rest },
  ref,
) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'h-11 w-full rounded-lg border bg-white px-3 text-[15px] text-ink',
        'focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20',
        invalid ? 'border-danger' : 'border-[#c3cfe2] hover:border-navy-400',
        'disabled:bg-mist',
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  );
});
