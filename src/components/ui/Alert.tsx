// Alert.tsx — inline status message (info / success / error). Text-led, not colour-only.
import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'info' | 'success' | 'error';

const tones: Record<Tone, string> = {
  info: 'bg-navy-50 text-navy-800 ring-navy-100',
  success: 'bg-emerald-50 text-success ring-emerald-100',
  error: 'bg-red-50 text-danger ring-red-100',
};
const labels: Record<Tone, string> = { info: 'Note', success: 'Success', error: 'Error' };

export function Alert({ tone = 'info', title, children }: { tone?: Tone; title?: string; children: ReactNode }) {
  return (
    <div className={cn('rounded-lg px-4 py-3 text-sm ring-1 ring-inset', tones[tone])} role={tone === 'error' ? 'alert' : 'status'}>
      <span className="font-semibold">{title ?? labels[tone]}: </span>
      {children}
    </div>
  );
}
