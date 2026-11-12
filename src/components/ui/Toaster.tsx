// Toaster.tsx — renders the toast stack (top-right). Accessible + auto-dismiss + reduced-motion safe.
import { useSyncExternalStore } from 'react';
import { subscribe, getSnapshot, dismissToast, type ToastTone } from '@/lib/toast';
import { cn } from '@/lib/cn';

const tones: Record<ToastTone, string> = {
  success: 'bg-white border-l-4 border-success text-ink',
  error: 'bg-white border-l-4 border-danger text-ink',
  info: 'bg-white border-l-4 border-navy-500 text-ink',
};
const labels: Record<ToastTone, string> = { success: '✓', error: '!', info: 'i' };
const labelTone: Record<ToastTone, string> = {
  success: 'bg-success text-white',
  error: 'bg-danger text-white',
  info: 'bg-navy-500 text-white',
};

export function Toaster() {
  const toasts = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  if (toasts.length === 0) return null;
  return (
    <div
      className="pointer-events-none fixed right-4 top-4 z-[60] flex w-[min(92vw,22rem)] flex-col gap-2"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.tone === 'error' ? 'alert' : 'status'}
          className={cn(
            'pointer-events-auto flex items-start gap-3 rounded-lg px-4 py-3 shadow-lift animate-fade-up',
            tones[t.tone],
          )}
        >
          <span className={cn('mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full text-xs font-bold', labelTone[t.tone])}>
            {labels[t.tone]}
          </span>
          <p className="flex-1 text-sm leading-snug">{t.message}</p>
          <button
            onClick={() => dismissToast(t.id)}
            aria-label="Dismiss"
            className="flex-none rounded px-1 text-slate2 hover:bg-mist"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
