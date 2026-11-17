// Input.tsx — text input with error state styling.
import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { invalid, className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'h-11 w-full rounded-lg border bg-white px-3 text-base sm:text-[15px] text-ink placeholder:text-slate2/50',
        'transition-colors focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20',
        invalid ? 'border-danger focus:border-danger focus:ring-danger/20' : 'border-[#c3cfe2] hover:border-navy-400',
        'disabled:bg-mist disabled:text-slate2/60',
        className,
      )}
      {...rest}
    />
  );
});
