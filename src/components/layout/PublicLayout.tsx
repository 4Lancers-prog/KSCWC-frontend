// PublicLayout.tsx — masthead (navy band + gold rule), responsive nav, content, footer.
import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { buttonClass } from '@/components/ui';
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
                    'relative rounded-md px-3 py-2 text-sm font-medium text-navy-100 transition-colors hover:bg-navy-800 hover:text-white',
                    // current page: gold bar under the label
                    "after:absolute after:inset-x-3 after:-bottom-0.5 after:h-[3px] after:rounded-full after:content-['']",
                    isActive ? 'text-white after:bg-gold-400' : 'hover:after:bg-navy-400',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-3">
            <Link to={homeTarget} className={buttonClass('gold', 'sm')}>
              {isAuthenticated ? L.dashboard : L.login}
            </Link>
            <button
              type="button"
              className={buttonClass('outlineLight', 'sm', 'lg:hidden')}
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((v) => !v)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                {open ? <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" /> : <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />}
              </svg>
              {open ? 'ಮುಚ್ಚಿ' : 'ಮೆನು'}
            </button>
          </div>
        </div>
        <div className="h-[3px] w-full bg-gold-500" />
        {open && (
          <nav id="mobile-nav" className="border-t border-navy-800 bg-navy-900 lg:hidden" aria-label="Mobile">
            <div className="container-content flex flex-col py-2">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-11 items-center rounded-md border-l-4 px-3 text-sm text-navy-100 hover:bg-navy-800',
                      isActive ? 'border-gold-400 bg-navy-800 text-white' : 'border-transparent',
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
