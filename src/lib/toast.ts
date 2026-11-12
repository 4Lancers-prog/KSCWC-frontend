// toast.ts — tiny external toast store usable from both React and non-React code
// (e.g. the global TanStack Query mutation error handler).
export type ToastTone = 'success' | 'error' | 'info';
export interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

let items: ToastItem[] = [];
const listeners = new Set<() => void>();
let seq = 0;

function emit() {
  for (const l of listeners) l();
}

export function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getSnapshot(): ToastItem[] {
  return items;
}

export function dismissToast(id: number): void {
  items = items.filter((t) => t.id !== id);
  emit();
}

export function toast(message: string, tone: ToastTone = 'info', durationMs = 4000): void {
  const item: ToastItem = { id: ++seq, message, tone };
  items = [...items, item];
  emit();
  if (durationMs > 0) {
    setTimeout(() => dismissToast(item.id), durationMs);
  }
}
