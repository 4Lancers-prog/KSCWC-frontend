// StatusBadge.tsx — text status badge (never colour-only; label always present).
import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

const tones: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  info: 'bg-navy-50 text-navy-700',
  success: 'bg-emerald-50 text-success',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-danger',
};

export function StatusBadge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', tones[tone])}>
      {label}
    </span>
  );
}
