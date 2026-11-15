// DashboardLayout.tsx — authenticated operator shell with a simple responsive sidebar.
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { SideNav, type SideNavGroup } from './SideNav';
import { L, H } from '@/i18n';
import { Emblem } from '@/components/Emblem';
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

const GROUPS: SideNavGroup[] = [
  {
    title: 'ಮುಖ್ಯ · Main',
    items: [
      { to: '/app', kn: L.dashboard, en: 'Dashboard', end: true },
      { to: '/app/portals', kn: 'ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್‌ಗಳು', en: 'Govt service portals' },
      { to: '/app/customers', kn: 'ಗ್ರಾಹಕರು', en: 'Customers' },
      { to: '/app/reports', kn: 'ವರದಿಗಳು', en: 'Reports' },
      { to: '/app/wallet', kn: 'ವಾಲೆಟ್', en: 'Wallet & top-up' },
      { to: '/app/applications', kn: 'ನನ್ನ ಅರ್ಜಿಗಳು', en: 'My applications' },
    ],
  },
  {
    title: 'ಸಾಧನಗಳು · Tools',
    items: [
      { to: '/app/fid', kn: 'ಎಫ್‌ಐಡಿ ಕಾರ್ಡ್', en: 'FID card maker' },
      { to: '/app/tools/b2-photo', kn: 'B2 ಫೋಟೋ', en: 'B2 photo converter' },
      { to: '/app/tools/passport-photo', kn: 'ಪಾಸ್‌ಪೋರ್ಟ್ ಫೋಟೋ', en: 'Passport photo' },
    ],
  },
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
              navigate('/login', { replace: true });
            }}
          >
            {L.logout}
          </Button>
        </div>
        <div className="h-[3px] w-full bg-gold-500" />
      </header>

      <div className="container-content grid grid-cols-[minmax(0,1fr)] gap-6 py-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
          <SideNav groups={GROUPS} label="Operator" />
        </aside>
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
      <p className="container-content pb-8 text-xs text-slate2">{H.footer_disclaimer}</p>
    </div>
  );
}
