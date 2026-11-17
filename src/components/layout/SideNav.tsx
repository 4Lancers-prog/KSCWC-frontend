// SideNav.tsx — the blue, bordered sidebar shared by the admin console and the operator dashboard.
// Desktop (lg+): grouped vertical menu, Kannada label + English sub-label, gold marker on the
// current page. Phones/tablets: one bar showing the current page; tap it to open the full grouped
// menu (closes again after choosing a page) — no hidden sideways-scrolling strip.
import { useEffect, useId, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/cn';

export interface SideNavItem {
  to: string;
  kn: string;
  en: string;
  end?: boolean;
  badge?: number;
}
export interface SideNavGroup {
  title?: string;
  items: SideNavItem[];
}

function isActive(item: SideNavItem, pathname: string) {
  return item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(item.to + '/');
}

export function SideNav({ groups, label }: { groups: SideNavGroup[]; label: string }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const listId = useId();
  useEffect(() => setOpen(false), [pathname]); // close after navigating

  const all = groups.flatMap((g) => g.items);
  const current = all.filter((i) => isActive(i, pathname)).sort((a, b) => b.to.length - a.to.length)[0];
  const waiting = all.reduce((n, i) => n + (i.badge ?? 0), 0);

  return (
    <nav aria-label={label} className="overflow-hidden rounded-xl2 border border-navy-700 bg-navy-900 shadow-card lg:flex lg:max-h-[calc(100vh-7.5rem)] lg:flex-col">
      <div className="h-[3px] w-full shrink-0 bg-gold-500" />

      {/* phones & tablets: current page + menu button */}
      <button
        type="button"
        className="flex min-h-12 w-full items-center gap-3 px-4 py-2 text-left text-white lg:hidden"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden className="shrink-0 text-gold-300">
          {open ? <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" /> : <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />}
        </svg>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{current?.kn ?? 'ಮೆನು'}</span>
          <span className="block truncate text-[11px] text-navy-200">{open ? 'ಮುಚ್ಚಿ · Close menu' : 'ಮೆನು ತೆರೆಯಿರಿ · Open menu'}</span>
        </span>
        {!open && waiting > 0 && (
          <span className="rounded-full bg-gold-500 px-2 text-xs font-bold text-navy-950" aria-label={`${waiting} waiting`}>{waiting}</span>
        )}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden
          className={cn('shrink-0 text-navy-200 transition-transform', open && 'rotate-180')}><path d="m6 9 6 6 6-6" /></svg>
      </button>

      <div id={listId} className={cn('p-2 lg:block lg:overflow-y-auto lg:overscroll-contain [scrollbar-color:theme(colors.navy.600)_transparent] [scrollbar-width:thin]', open ? 'block border-t border-navy-700 lg:border-t-0' : 'hidden')}>
        {groups.map((g, gi) => (
          <div key={g.title ?? gi} className={cn(gi > 0 && 'mt-1.5 border-t border-navy-700 pt-1.5')}>
            {g.title && (
              <p className="px-3 pb-0.5 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-gold-300/90">{g.title}</p>
            )}
            {g.items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.end}
                className={({ isActive: a }) =>
                  cn(
                    'group relative mb-px flex min-h-11 items-center justify-between gap-3 rounded-lg border px-3 py-1.5 transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400',
                    a ? 'border-navy-500 bg-navy-600 text-white shadow-sm' : 'border-transparent text-navy-50 hover:border-navy-600 hover:bg-navy-800 hover:text-white',
                  )
                }
              >
                {({ isActive: a }) => (
                  <>
                    <span aria-hidden className={cn('absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-gold-400', !a && 'hidden')} />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold leading-tight">{it.kn}</span>
                      <span className={cn('block text-[11px] leading-tight', a ? 'text-navy-100' : 'text-navy-300 group-hover:text-navy-200')}>{it.en}</span>
                    </span>
                    {!!it.badge && it.badge > 0 && (
                      <span className="inline-flex min-w-[1.4rem] items-center justify-center rounded-full bg-gold-500 px-1.5 text-xs font-bold text-navy-950" aria-label={`${it.badge} waiting`}>
                        {it.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </div>
    </nav>
  );
}
