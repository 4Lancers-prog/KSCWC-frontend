// Button.tsx — primary/secondary/ghost button with loading + disabled states.
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outlineLight';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  block?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-navy-600 text-white shadow-sm hover:bg-navy-700 active:bg-navy-800 disabled:bg-navy-300',
  secondary:
    'bg-white text-navy-700 ring-1 ring-inset ring-line hover:bg-mist disabled:text-slate2/50',
  ghost: 'bg-transparent text-navy-700 hover:bg-navy-50 disabled:text-slate2/50',
  danger: 'bg-danger text-white shadow-sm hover:brightness-110 disabled:opacity-60',
  // for use on the dark navy header — always visible
  outlineLight: 'bg-white/10 text-white ring-1 ring-inset ring-white/40 hover:bg-white/20',
};
const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-[15px]',
  lg: 'h-12 px-6 text-base',
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', size = 'md', loading = false, block = false, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition',
        'active:scale-[.98] disabled:cursor-not-allowed disabled:active:scale-100',
        variants[variant],
        sizes[size],
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
});
