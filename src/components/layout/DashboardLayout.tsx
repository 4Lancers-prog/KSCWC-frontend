// DashboardLayout.tsx — authenticated operator shell with a simple responsive sidebar.
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { L, H } from '@/i18n';
import { Emblem } from '@/components/Emblem';
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

const LINKS = [
  { to: '/app', label: L.dashboard, end: true },
  { to: '/app/customers', label: 'ಗ್ರಾಹಕರು' },
  { to: '/app/reports', label: 'ವರದಿಗಳು' },
  { to: '/app/wallet', label: 'ವಾಲೆಟ್' },
  { to: '/app/fid', label: 'ಎಫ್‌ಐಡಿ ಕಾರ್ಡ್' },
  { to: '/app/tools/b2-photo', label: 'B2 ಫೋಟೋ' },
  { to: '/app/tools/passport-photo', label: 'ಪಾಸ್‌ಪೋರ್ಟ್ ಫೋಟೋ' },
];

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-mist">
      <header className="bg-navy-900 text-white">
        <div className="flag-stripe" />
        <div className="container-content flex items-center gap-3 py-3">
          <Emblem size={36} />
          <span className="font-display text-base font-semibold">{L.org_short}</span>
          <span className="ml-auto hidden text-sm text-navy-100 sm:block">{user?.fullName}</span>
          {user && user.role !== 'USER' && (
            <NavLink to="/admin" className="rounded-lg bg-gold-500 px-3 py-1.5 text-sm font-semibold text-navy-950 hover:bg-gold-400">
              ನಿರ್ವಾಹಕ
            </NavLink>
          )}
          <Button
            variant="outlineLight"
            size="sm"
            className="ml-2"
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
          >
            {L.logout}
          </Button>
        </div>
        <div className="h-[3px] w-full bg-gold-500" />
      </header>

      <div className="container-content grid gap-6 py-6 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <nav className="flex gap-1 overflow-x-auto lg:flex-col" aria-label="Operator">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  cn(
                    'whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate2 hover:bg-white',
                    isActive && 'bg-white text-navy-800 shadow-card',
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main>
          <Outlet />
        </main>
      </div>
      <p className="container-content pb-8 text-xs text-slate2">{H.footer_disclaimer}</p>
    </div>
  );
}
