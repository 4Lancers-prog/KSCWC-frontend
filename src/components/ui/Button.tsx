// Button.tsx — "keycap" buttons: a darker bottom edge makes them read as pressable at a glance
// (also on phones, where there is no hover), and they press down when tapped.
// Use buttonClass() to give a <Link> exactly the same look.
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold' | 'outlineLight';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  block?: boolean;
}

const base =
  'inline-flex select-none items-center justify-center gap-2 rounded-lg font-semibold leading-tight ' +
  'transition-[background-color,border-color,color,box-shadow,transform] duration-100 ' +
  // press: drop by the edge height, edge shrinks
  'enabled:active:translate-y-[2px] [&[href]]:active:translate-y-[2px] ' +
  'disabled:cursor-not-allowed disabled:border-transparent disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none';

const variants: Record<ButtonVariant, string> = {
  primary:
    'border border-navy-700 bg-navy-600 text-white shadow-[0_3px_0_0_theme(colors.navy.900)] ' +
    'hover:bg-navy-500 active:shadow-[0_1px_0_0_theme(colors.navy.900)]',
  secondary:
    'border-[1.5px] border-navy-300 bg-white text-navy-800 shadow-[0_3px_0_0_theme(colors.navy.200)] ' +
    'hover:border-navy-500 hover:bg-navy-50 hover:shadow-[0_3px_0_0_theme(colors.navy.500)] active:shadow-[0_1px_0_0_theme(colors.navy.500)]',
  danger:
    'border border-red-700 bg-danger text-white shadow-[0_3px_0_0_#7f1d1d] hover:brightness-110 active:shadow-[0_1px_0_0_#7f1d1d]',
  gold:
    'border border-gold-600 bg-gold-500 text-navy-950 shadow-[0_3px_0_0_theme(colors.gold.700)] ' +
    'hover:bg-gold-400 active:shadow-[0_1px_0_0_theme(colors.gold.700)]',
  // quiet, for low-priority actions inside dense UI; still underlined so it reads as an action
  ghost: 'text-navy-700 underline decoration-navy-300 underline-offset-[3px] hover:bg-navy-50 hover:decoration-navy-700',
  // on the dark navy header
  outlineLight:
    'border-[1.5px] border-white/70 bg-white/10 text-white shadow-[0_3px_0_0_rgba(255,255,255,0.25)] ' +
    'hover:bg-white hover:text-navy-900 active:shadow-[0_1px_0_0_rgba(255,255,255,0.25)]',
};
// Heights keep comfortable touch targets (sm = 40px). Top padding is 6px larger than bottom: the
// Kannada font reserves ~9px below the baseline but letters use ~3px, so equal padding left labels
// visibly ~3px high. This optically centres them (measured; applies to Latin text too).
const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-3.5 pt-[9px] pb-[3px] text-sm',
  md: 'min-h-11 px-5 pt-[11px] pb-[5px] text-[15px]',
  lg: 'min-h-12 px-6 pt-[13px] pb-[7px] text-base',
};

/** Class string for anything that should look like a button (e.g. a router <Link>). */
export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', extra?: string) {
  return cn(base, variants[variant], sizes[size], extra);
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', size = 'md', loading = false, block = false, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass(variant, size, cn(block && 'w-full', className))}
      {...rest}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
});
