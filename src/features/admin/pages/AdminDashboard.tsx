// AdminDashboard.tsx — quick links into admin areas + a live pending-approvals highlight.
import { Link } from 'react-router-dom';
import { useAdminUsers } from '../admin.api';

const TILES = [
  { to: '/admin/approvals', kn: 'ಬಳಕೆದಾರ ಅನುಮೋದನೆಗಳು', en: 'User approvals' },
  { to: '/admin/services', kn: 'ಸೇವಾ ಪಟ್ಟಿ', en: 'Service catalogue' },
  { to: '/admin/announcements', kn: 'ಪ್ರಕಟಣೆಗಳು / ವೀಡಿಯೊ', en: 'Announcements & videos' },
  { to: '/admin/committees', kn: 'ನಾಯಕತ್ವ / ಸಮಿತಿಗಳು', en: 'Leadership & committees' },
  { to: '/admin/links', kn: 'ಸರ್ಕಾರಿ ಕೊಂಡಿಗಳು', en: 'Government links' },
  { to: '/admin/documents', kn: 'ದಾಖಲೆಗಳು', en: 'Documents' },
  { to: '/admin/wallets', kn: 'ವಾಲೆಟ್ ನಿರ್ವಹಣೆ', en: 'Wallet management' },
  { to: '/admin/applications', kn: 'ಅರ್ಜಿಗಳು / ದೂರುಗಳು', en: 'Applications & grievances' },
  { to: '/admin/audit', kn: 'ಆಡಿಟ್ ಲಾಗ್‌ಗಳು', en: 'Audit logs' },
];

export function AdminDashboard() {
  const pending = useAdminUsers({ status: 'PENDING_APPROVAL', page: 1 });
  const pendingCount = pending.data?.total ?? 0;

  return (
    <div className="animate-fade-up">
      <div className="gold-rule mb-3" />
      <h1 className="font-display text-2xl text-navy-900">ನಿರ್ವಾಹಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್</h1>
      <p className="text-sm text-slate2">Manage users, content and finances</p>

      {/* Pending registrations highlight — always visible so new requests are obvious */}
      <Link
        to="/admin/approvals"
        className="mt-6 flex items-center justify-between gap-4 rounded-xl2 bg-gradient-to-r from-navy-900 to-navy-700 p-6 text-white shadow-card transition hover:shadow-lift"
      >
        <div>
          <p className="font-display text-lg">ಬಾಕಿ ನೋಂದಣಿ ವಿನಂತಿಗಳು</p>
          <p className="text-sm text-navy-100">Pending registration requests awaiting approval</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="grid h-14 min-w-14 place-items-center rounded-xl bg-gold-500 px-3 font-display text-2xl font-bold text-navy-950">
            {pending.isLoading ? '…' : pendingCount}
          </span>
          <span className="hidden text-sm font-semibold text-gold-300 sm:block">ಪರಿಶೀಲಿಸಿ →</span>
        </div>
      </Link>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map((t, i) => (
          <Link
            key={t.to}
            to={t.to}
            style={{ animationDelay: `${i * 45}ms` }}
            className="hover-lift animate-fade-up rounded-xl2 border border-line bg-white p-5 shadow-card"
          >
            <p className="font-display text-lg text-navy-900">
              {t.kn}
              {t.to === '/admin/approvals' && pendingCount > 0 && (
                <span className="ml-2 inline-flex items-center rounded-full bg-gold-500 px-2 py-0.5 align-middle text-xs font-bold text-navy-950">
                  {pendingCount}
                </span>
              )}
            </p>
            <p className="text-sm text-slate2">{t.en}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
