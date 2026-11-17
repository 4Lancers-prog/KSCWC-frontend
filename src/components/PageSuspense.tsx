// PageSuspense.tsx — shown for a moment while a page's code loads.
import { Suspense, type ReactNode } from 'react';
import { Spinner } from '@/components/ui';

export function PageSuspense({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="grid min-h-[40vh] place-items-center" aria-busy="true"><Spinner className="h-7 w-7 text-navy-500" /></div>}>
      {children}
    </Suspense>
  );
}
