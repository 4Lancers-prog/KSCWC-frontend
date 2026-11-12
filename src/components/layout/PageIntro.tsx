// PageIntro.tsx — consistent inner-page header (Kannada title + English helper + gold rule).
import { type ReactNode } from 'react';

export function PageIntro({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="container-content py-12">
      <div className="gold-rule mb-4" />
      <h1 className="font-display text-2xl text-navy-900 sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-slate2">{subtitle}</p>}
      {children && <div className="mt-8">{children}</div>}
    </div>
  );
}

export function ComingSoonNote() {
  return (
    <div className="rounded-xl2 border border-dashed border-line bg-mist p-8 text-center">
      <p className="font-display text-navy-900">ಈ ವಿಭಾಗದ ವಿಷಯವನ್ನು ನಿರ್ವಾಹಕರು ನಿರ್ವಹಿಸುತ್ತಾರೆ</p>
      <p className="mt-1 text-sm text-slate2">
        This section is managed from the admin console and will display live content once published.
      </p>
    </div>
  );
}
