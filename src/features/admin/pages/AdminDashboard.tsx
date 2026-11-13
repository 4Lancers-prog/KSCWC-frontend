// AdminDashboard.tsx — what is waiting on staff right now (live), plus quick links.
import { Link } from 'react-router-dom';
import { useAdminOverview } from '../admin.api';

const LINKS = [
  { to: '/admin/customers', kn: 'ಗ್ರಾಹಕರು / ವರದಿ', en: 'All operators’ customers & reports' },
  { to: '/admin/wallets', kn: 'ವಾಲೆಟ್ ನಿರ್ವಹಣೆ', en: 'Wallet management' },
  { to: '/admin/services', kn: 'ಸೇವಾ ಪಟ್ಟಿ', en: 'Service catalogue' },
  { to: '/admin/announcements', kn: 'ಪ್ರಕಟಣೆಗಳು / ವೀಡಿಯೊ', en: 'Announcements & videos' },
  { to: '/admin/committees', kn: 'ನಾಯಕತ್ವ / ಸಮಿತಿಗಳು', en: 'Leadership & committees' },
  { to: '/admin/links', kn: 'ಸರ್ಕಾರಿ ಕೊಂಡಿಗಳು', en: 'Government links' },
  { to: '/admin/documents', kn: 'ದಾಖಲೆಗಳು', en: 'Documents' },
  { to: '/admin/settings', kn: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು', en: 'Settings (FID portal link)' },
  { to: '/admin/audit', kn: 'ಆಡಿಟ್ ಲಾಗ್‌ಗಳು', en: 'Audit logs' },
];

export function AdminDashboard() {
  const { data, isLoading, isError } = useAdminOverview();
  const n = (v: number | undefined) => (isLoading ? '…' : v ?? 0);

  const queues = [
    { to: '/admin/approvals', kn: 'ಬಾಕಿ ನೋಂದಣಿಗಳು', en: 'Registrations awaiting approval', count: data?.pendingUsers },
    { to: '/admin/manual-topups', kn: 'UPI ಟಾಪ್-ಅಪ್ ವಿನಂತಿಗಳು', en: 'UPI top-ups to verify', count: data?.pendingManualTopups },
    { to: '/admin/applications', kn: 'ಹೊಸ ಅರ್ಜಿಗಳು', en: 'New insurance / membership / training', count: data?.newApplications },
    { to: '/admin/applications?tab=grievances', kn: 'ತೆರೆದ ದೂರುಗಳು', en: 'Open grievances', count: data?.openGrievances },
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
        {queues.map((q) => {
          const hot = (q.count ?? 0) > 0;
          return (
            <Link key={q.to} to={q.to}
              className={`flex items-center justify-between gap-4 rounded-xl2 p-5 shadow-card transition hover:shadow-lift ${hot ? 'bg-gradient-to-r from-navy-900 to-navy-700 text-white' : 'border border-line bg-white'}`}>
              <div>
                <p className={`font-display text-lg ${hot ? '' : 'text-navy-900'}`}>{q.kn}</p>
                <p className={`text-sm ${hot ? 'text-navy-100' : 'text-slate2'}`}>{q.en}</p>
              </div>
              <span className={`grid h-14 min-w-14 place-items-center rounded-xl px-3 font-display text-2xl font-bold ${hot ? 'bg-gold-500 text-navy-950' : 'bg-mist text-slate2'}`}>
                {n(q.count)}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LINKS.map((t, i) => (
          <Link key={t.to} to={t.to} style={{ animationDelay: `${i * 40}ms` }}
            className="hover-lift animate-fade-up rounded-xl2 border border-line bg-white p-5 shadow-card">
            <p className="font-display text-lg text-navy-900">{t.kn}</p>
            <p className="text-sm text-slate2">{t.en}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
