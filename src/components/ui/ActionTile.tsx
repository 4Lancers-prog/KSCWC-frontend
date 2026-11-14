// ActionTile.tsx — a card that IS a link: icon, title, optional detail, and a round "open" badge.
// Looks raised (see .tile in globals.css) so it is obviously pressable; info cards stay flat.
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { Icons, type IconName } from './icons';

export function ActionTile({
  to, icon, title, subtitle, detail, count, dark, className,
}: {
  to: string;
  icon?: IconName;
  title: ReactNode;      // Kannada label
  subtitle?: ReactNode;  // English label
  detail?: ReactNode;    // small extra line (status, hint)
  count?: number | string; // big number for queues
  dark?: boolean;        // the single most important tile on a page
  className?: string;
}) {
  const Icon = icon ? Icons[icon] : null;
  const Chevron = Icons.chevron;
  return (
    <Link to={to} className={cn('tile', dark && 'tile-dark', className)}>
      <div className="flex items-start gap-3">
        {Icon && (
          <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl', dark ? 'bg-white/10 text-gold-300' : 'bg-navy-50 text-navy-700')}>
            <Icon />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className={cn('font-display text-lg leading-snug', dark ? 'text-white' : 'text-navy-900')}>{title}</p>
          {subtitle && <p className={cn('text-sm', dark ? 'text-navy-100' : 'text-slate2')}>{subtitle}</p>}
        </div>
        {count !== undefined ? (
          <span className={cn('grid h-11 min-w-11 place-items-center rounded-xl px-2.5 font-display text-2xl font-bold',
            dark ? 'bg-gold-500 text-navy-950' : 'bg-mist text-slate2')}>{count}</span>
        ) : (
          <span className="tile-open"><Chevron /></span>
        )}
      </div>
      {detail && <div className={cn('mt-3 text-xs', dark ? 'text-gold-300' : 'text-slate2')}>{detail}</div>}
    </Link>
  );
}
