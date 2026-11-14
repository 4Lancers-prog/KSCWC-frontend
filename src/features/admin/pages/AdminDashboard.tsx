// AdminDashboard.tsx — what is waiting on staff right now (live), plus quick links.
import { ActionTile } from '@/components/ui';
import type { IconName } from '@/components/ui/icons';
import { useAdminOverview } from '../admin.api';

const LINKS: { to: string; kn: string; en: string; icon: IconName }[] = [
  { to: '/admin/customers', kn: 'ಗ್ರಾಹಕರು / ವರದಿ', en: 'All operators’ customers & reports', icon: 'chart' },
  { to: '/admin/wallets', kn: 'ವಾಲೆಟ್ ನಿರ್ವಹಣೆ', en: 'Wallet management', icon: 'wallet' },
  { to: '/admin/services', kn: 'ಸೇವಾ ಪಟ್ಟಿ', en: 'Service catalogue', icon: 'grid' },
  { to: '/admin/announcements', kn: 'ಪ್ರಕಟಣೆಗಳು / ವೀಡಿಯೊ', en: 'Announcements & videos', icon: 'megaphone' },
  { to: '/admin/committees', kn: 'ನಾಯಕತ್ವ / ಸಮಿತಿಗಳು', en: 'Leadership & committees', icon: 'people' },
  { to: '/admin/links', kn: 'ಸರ್ಕಾರಿ ಕೊಂಡಿಗಳು', en: 'Government links', icon: 'link' },
  { to: '/admin/documents', kn: 'ದಾಖಲೆಗಳು', en: 'Documents', icon: 'file' },
  { to: '/admin/settings', kn: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು', en: 'Settings (FID portal link)', icon: 'settings' },
  { to: '/admin/audit', kn: 'ಆಡಿಟ್ ಲಾಗ್‌ಗಳು', en: 'Audit logs', icon: 'shield' },
];

export function AdminDashboard() {
  const { data, isLoading, isError } = useAdminOverview();
  const n = (v: number | undefined) => (isLoading ? '…' : v ?? 0);

  const queues: { to: string; kn: string; en: string; icon: IconName; count?: number }[] = [
    { to: '/admin/approvals', kn: 'ಬಾಕಿ ನೋಂದಣಿಗಳು', en: 'Registrations awaiting approval', icon: 'userCheck', count: data?.pendingUsers },
    { to: '/admin/manual-topups', kn: 'UPI ಟಾಪ್-ಅಪ್ ವಿನಂತಿಗಳು', en: 'UPI top-ups to verify', icon: 'qr', count: data?.pendingManualTopups },
    { to: '/admin/applications', kn: 'ಹೊಸ ಅರ್ಜಿಗಳು', en: 'New insurance / membership / training', icon: 'inbox', count: data?.newApplications },
    { to: '/admin/applications?tab=grievances', kn: 'ತೆರೆದ ದೂರುಗಳು', en: 'Open grievances', icon: 'alert', count: data?.openGrievances },
  ];

  return (
    <div className="animate-fade-up">
      <div className="gold-rule mb-3" />
      <h1 className="font-display text-2xl text-navy-900">ನಿರ್ವಾಹಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್</h1>
      <p className="text-sm text-slate2">
        Waiting on you right now · updates automatically
        {data && <> · {data.activeUsers} active operators · {data.totalCustomers} customer records</>}
      </p>
      {isError && <p className="mt-3 text-sm text-danger">ಎಣಿಕೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗಲಿಲ್ಲ · Could not load counts.</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {queues.map((q) => (
          // a queue with work waiting is the dark (most important) tile
          <ActionTile key={q.to} to={q.to} icon={q.icon} title={q.kn} subtitle={q.en}
            count={n(q.count)} dark={(q.count ?? 0) > 0} />
        ))}
      </div>

      <h2 className="mt-10 font-display text-lg text-navy-900">ನಿರ್ವಹಣೆ · Manage</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LINKS.map((t) => (
          <ActionTile key={t.to} to={t.to} icon={t.icon} title={t.kn} subtitle={t.en} />
        ))}
      </div>
    </div>
  );
}
