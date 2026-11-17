// BottomNav.tsx — operators on phones: the five most-used pages, right under the thumb.
// Everything else is in the "Menu" bar at the top of the page.
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { Icons, type IconName } from '@/components/ui/icons';

const ITEMS: { to: string; kn: string; icon: IconName; end?: boolean }[] = [
  { to: '/app', kn: 'ಮುಖಪುಟ', icon: 'home', end: true },
  { to: '/app/portals', kn: 'ಪೋರ್ಟಲ್', icon: 'landmark' },
  { to: '/app/templates', kn: 'ನಮೂನೆ', icon: 'file' },
  { to: '/app/customers', kn: 'ಗ್ರಾಹಕರು', icon: 'users' },
  { to: '/app/wallet', kn: 'ವಾಲೆಟ್', icon: 'wallet' },
];

export function BottomNav() {
  return (
    <nav aria-label="Quick links"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-700 bg-navy-900 pb-[env(safe-area-inset-bottom,0px)] lg:hidden">
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {ITEMS.map((it) => {
          const Icon = Icons[it.icon];
          return (
            <li key={it.to}>
              <NavLink to={it.to} end={it.end}
                className={({ isActive }) => cn(
                  'relative flex min-h-[60px] flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-semibold',
                  "before:absolute before:inset-x-4 before:top-0 before:h-[3px] before:rounded-b-full before:content-['']",
                  isActive ? 'text-white before:bg-gold-400' : 'text-navy-200 hover:text-white',
                )}>
                <Icon />
                <span className="truncate">{it.kn}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
