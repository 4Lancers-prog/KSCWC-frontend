// AdminLayout.tsx — admin console shell + nav (server enforces every permission).
// Sidebar: shared blue SideNav. Nav badges are live (polled) so new sign-ups, UPI top-ups and applications from users
// show up without reloading.
import { Outlet, useNavigate } from 'react-router-dom';
import { Emblem } from '@/components/Emblem';
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useAdminOverview } from '@/features/admin/admin.api';
import { SideNav, type SideNavGroup } from './SideNav';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const o = useAdminOverview().data;
  const groups: SideNavGroup[] = [
    {
      title: 'ಕಾರ್ಯ ಸರತಿ · Work queues',
      items: [
        { to: '/admin', kn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', en: 'Dashboard', end: true },
        { to: '/admin/approvals', kn: 'ಅನುಮೋದನೆಗಳು', en: 'User approvals', badge: o?.pendingUsers },
        { to: '/admin/manual-topups', kn: 'UPI ಟಾಪ್-ಅಪ್', en: 'UPI top-ups', badge: o?.pendingManualTopups },
        { to: '/admin/applications', kn: 'ಅರ್ಜಿಗಳು', en: 'Applications & grievances', badge: o ? o.newApplications + o.openGrievances : 0 },
      ],
    },
    {
      title: 'ದಾಖಲೆಗಳು · Records',
      items: [
        { to: '/admin/customers', kn: 'ಗ್ರಾಹಕರು / ವರದಿ', en: 'Customers & reports' },
        { to: '/admin/wallets', kn: 'ವಾಲೆಟ್‌ಗಳು', en: 'Wallets' },
        { to: '/admin/audit', kn: 'ಆಡಿಟ್', en: 'Audit logs' },
      ],
    },
    {
      title: 'ವಿಷಯ · Content',
      items: [
        { to: '/admin/services', kn: 'ಸೇವೆಗಳು', en: 'Service catalogue' },
        { to: '/admin/announcements', kn: 'ಪ್ರಕಟಣೆಗಳು', en: 'Announcements' },
        { to: '/admin/committees', kn: 'ಸಮಿತಿಗಳು', en: 'Committees' },
        { to: '/admin/links', kn: 'ಕೊಂಡಿಗಳು', en: 'Government links' },
        { to: '/admin/documents', kn: 'ದಾಖಲೆಗಳು', en: 'Documents' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-mist">
      <header className="bg-navy-950 text-white">
        <div className="flag-stripe" />
        <div className="container-content flex items-center gap-3 py-3">
          <Emblem size={34} />
          <span className="font-display font-semibold">ನಿರ್ವಾಹಕ ಕನ್ಸೋಲ್</span>
          <span className="ml-auto hidden text-sm text-navy-100 sm:block">{user?.fullName} · {user?.role}</span>
          <Button variant="outlineLight" size="sm" className="ml-2"
            onClick={async () => { await logout(); navigate('/admin/login', { replace: true }); }}>ನಿರ್ಗಮನ</Button>
        </div>
        <div className="h-[3px] w-full bg-gold-500" />
      </header>
      <div className="container-content grid grid-cols-[minmax(0,1fr)] gap-6 py-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
          <SideNav groups={groups} label="Admin" />
        </aside>
        <main className="min-w-0"><Outlet /></main>
      </div>
    </div>
  );
}
