// AuthShell.tsx — centered card for auth screens, with the masthead identity.
import { Link } from 'react-router-dom';
import { type ReactNode } from 'react';
import { Emblem } from '@/components/Emblem';
import { L, H } from '@/i18n';

export function AuthShell({ title, subtitle, children, footer }: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-mist lg:grid-cols-2">
      {/* brand side */}
      <div className="hidden flex-col justify-between bg-navy-900 p-10 text-white lg:flex">
        <Link to="/" className="flex items-center gap-3">
          <Emblem />
          <span className="font-display text-lg font-bold">{L.org_short}</span>
        </Link>
        <div>
          <div className="gold-rule mb-5" />
          <p className="font-display text-2xl leading-snug">{L.org_name}</p>
          <p className="mt-3 max-w-sm text-navy-100">{H.hero_body}</p>
        </div>
        <p className="text-xs text-navy-300">{H.footer_disclaimer}</p>
      </div>

      {/* form side */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-6 flex items-center gap-2 lg:hidden">
            <Emblem size={36} />
            <span className="font-display font-bold text-navy-900">{L.org_short}</span>
          </Link>
          <div className="gold-rule mb-4" />
          <h1 className="font-display text-2xl text-navy-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate2">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 text-sm text-slate2">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
