// PublicLayout.tsx — masthead (navy band + gold rule), responsive nav, content, footer.
import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { L, H } from '@/i18n';
import { Emblem } from '@/components/Emblem';
import { useAuth } from '@/hooks/useAuth';

const NAV: { to: string; label: string; helper: string }[] = [
  { to: '/', label: L.nav_home, helper: H.nav_home },
  { to: '/about', label: L.nav_about, helper: H.nav_about },
  { to: '/services', label: L.nav_services, helper: H.nav_services },
  { to: '/announcements', label: L.nav_announcements, helper: H.nav_announcements },
  { to: '/committees', label: L.nav_committees, helper: H.nav_committees },
  { to: '/government-links', label: L.nav_links, helper: H.nav_links },
  { to: '/contact', label: L.nav_contact, helper: H.nav_contact },
];

export function PublicLayout() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const homeTarget = !isAuthenticated ? '/login' : user && user.role !== 'USER' ? '/admin' : '/app';

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-40 bg-navy-900 text-white">
        <div className="flag-stripe" />
        <div className="container-content flex items-center gap-3 py-3">
          <Link to="/" className="flex items-center gap-3">
            <Emblem />
            <span className="leading-tight">
              <span className="block font-display text-base font-bold text-white sm:text-lg">
                {L.org_short}
              </span>
              <span className="hidden text-xs text-navy-100 sm:block">{H.org_name}</span>
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Primary">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-2 text-sm font-medium text-navy-100 hover:bg-navy-800 hover:text-white',
                    isActive && 'bg-navy-800 text-white',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-3">
            <Link
              to={homeTarget}
              className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950 transition hover:bg-gold-400 active:scale-[.98]"
            >
              {isAuthenticated ? L.dashboard : L.login}
            </Link>
            <button
              className="rounded-md p-2 text-navy-100 hover:bg-navy-800 lg:hidden"
              aria-label="Menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
        <div className="h-[3px] w-full bg-gold-500" />
        {open && (
          <nav className="border-t border-navy-800 bg-navy-900 lg:hidden" aria-label="Mobile">
            <div className="container-content flex flex-col py-2">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'rounded-md px-3 py-2.5 text-sm text-navy-100 hover:bg-navy-800',
                      isActive && 'bg-navy-800 text-white',
                    )
                  }
                >
                  {item.label} <span className="text-xs text-navy-300">· {item.helper}</span>
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-16 border-t border-line bg-mist">
        <div className="container-content py-10">
          <div className="flex items-start gap-3">
            <Emblem size={36} />
            <div>
              <p className="font-display text-navy-900">{L.org_name}</p>
              <p className="mt-1 max-w-prose text-sm text-slate2">{L.footer_disclaimer}</p>
            </div>
          </div>
          <p className="mt-6 text-xs text-slate2">
            © {new Date().getFullYear()} {H.org_name}. {H.footer_disclaimer}
          </p>
        </div>
      </footer>
    </div>
  );
}
