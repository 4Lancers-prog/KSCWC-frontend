// AdminLayout.tsx — admin console shell + nav (server enforces every permission).
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { Emblem } from '@/components/Emblem';
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

const LINKS = [
  { to: '/admin', label: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', end: true },
  { to: '/admin/approvals', label: 'ಅನುಮೋದನೆಗಳು' },
  { to: '/admin/services', label: 'ಸೇವೆಗಳು' },
  { to: '/admin/announcements', label: 'ಪ್ರಕಟಣೆಗಳು' },
  { to: '/admin/committees', label: 'ಸಮಿತಿಗಳು' },
  { to: '/admin/links', label: 'ಕೊಂಡಿಗಳು' },
  { to: '/admin/documents', label: 'ದಾಖಲೆಗಳು' },
  { to: '/admin/wallets', label: 'ವಾಲೆಟ್‌ಗಳು' },
  { to: '/admin/manual-topups', label: 'UPI ಟಾಪ್-ಅಪ್' },
  { to: '/admin/applications', label: 'ಅರ್ಜಿಗಳು' },
  { to: '/admin/audit', label: 'ಆಡಿಟ್' },
  { to: '/admin/settings', label: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು' },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-mist">
      <header className="bg-navy-950 text-white">
        <div className="flag-stripe" />
        <div className="container-content flex items-center gap-3 py-3">
          <Emblem size={34} />
          <span className="font-display font-semibold">ನಿರ್ವಾಹಕ ಕನ್ಸೋಲ್</span>
          <span className="ml-auto hidden text-sm text-navy-100 sm:block">{user?.fullName} · {user?.role}</span>
          <Button variant="outlineLight" size="sm" className="ml-2"
            onClick={async () => { await logout(); navigate('/login'); }}>ನಿರ್ಗಮನ</Button>
        </div>
        <div className="h-[3px] w-full bg-gold-500" />
      </header>
      <div className="container-content grid gap-6 py-6 lg:grid-cols-[200px_1fr]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <nav className="flex gap-1 overflow-x-auto lg:flex-col" aria-label="Admin">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end}
                className={({ isActive }) => cn('whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate2 hover:bg-white', isActive && 'bg-white text-navy-800 shadow-card')}>
                {l.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main><Outlet /></main>
      </div>
    </div>
  );
}
