// SideNav.tsx — the blue, bordered sidebar shared by the admin console and the operator dashboard.
// Desktop: grouped vertical menu with Kannada label + English sub-label and a gold marker on the
// current page. Mobile: a horizontally scrollable blue strip (Kannada labels only).
import { NavLink } from 'react-router-dom';
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

export function SideNav({ groups, label }: { groups: SideNavGroup[]; label: string }) {
  return (
    <nav
      aria-label={label}
      className="overflow-hidden rounded-xl2 border border-navy-700 bg-navy-900 shadow-card lg:flex lg:max-h-[calc(100vh-7.5rem)] lg:flex-col"
    >
      <div className="h-[3px] w-full shrink-0 bg-gold-500" />
      {/* phones: the menu scrolls sideways — fade the right edge so it's clear there is more */}
      <div className="relative after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-10 after:bg-gradient-to-l after:from-navy-900 after:to-transparent after:content-[''] lg:after:hidden">
      <div className="flex gap-1 overflow-x-auto p-2 lg:block lg:overflow-y-auto lg:overscroll-contain lg:p-2 [scrollbar-color:theme(colors.navy.600)_transparent] [scrollbar-width:thin]">
        {groups.map((g, gi) => (
          <div
            key={g.title ?? gi}
            className={cn('flex shrink-0 gap-1 lg:block', gi > 0 && 'lg:mt-1.5 lg:border-t lg:border-navy-700 lg:pt-1.5')}
          >
            {g.title && (
              <p className="hidden px-3 pb-0.5 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-gold-300/90 lg:block">
                {g.title}
              </p>
            )}
            {g.items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.end}
                className={({ isActive }) =>
                  cn(
                    'group relative flex shrink-0 items-center justify-between gap-3 whitespace-nowrap rounded-lg border px-3 py-1.5 transition-colors lg:mb-px',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400',
                    isActive
                      ? 'border-navy-500 bg-navy-600 text-white shadow-sm'
                      : 'border-transparent text-navy-50 hover:border-navy-600 hover:bg-navy-800 hover:text-white',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {/* gold marker on the current page */}
                    <span
                      aria-hidden
                      className={cn(
                        'absolute inset-y-1.5 left-0 hidden w-[3px] rounded-full bg-gold-400 lg:block',
                        !isActive && 'lg:hidden',
                      )}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold leading-tight">{it.kn}</span>
                      <span
                        className={cn(
                          'hidden text-[11px] leading-tight lg:block',
                          isActive ? 'text-navy-100' : 'text-navy-300 group-hover:text-navy-200',
                        )}
                      >
                        {it.en}
                      </span>
                    </span>
                    {!!it.badge && it.badge > 0 && (
                      <span
                        className="inline-flex min-w-[1.4rem] items-center justify-center rounded-full bg-gold-500 px-1.5 text-xs font-bold text-navy-950"
                        aria-label={`${it.badge} waiting`}
                      >
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
      </div>
    </nav>
  );
}
