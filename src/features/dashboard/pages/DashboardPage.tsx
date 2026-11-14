// DashboardPage.tsx — operator landing: wallet, pending items waiting on the council, latest news.
import { Link } from 'react-router-dom';
import { ActionTile, Icons } from '@/components/ui';
import type { IconName } from '@/components/ui/icons';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, formatPaise } from '@/lib/format';
import { useWallet, useMyManualTopups } from '@/features/wallet/wallet.api';
import { useMyApplications } from '@/features/applications/applications.api';
import { usePublicAnnouncements } from '@/features/public-content/public-content.api';

const TILES: { to: string; kn: string; en: string; hint: string; icon: IconName }[] = [
  { to: '/app/customers', kn: 'ಗ್ರಾಹಕರು', en: 'Customers', hint: 'ದಾಖಲೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ', icon: 'users' },
  { to: '/app/fid', kn: 'ಎಫ್‌ಐಡಿ ಕಾರ್ಡ್', en: 'FID card', hint: '₹5 ಪ್ರತಿ ಕಾರ್ಡ್', icon: 'idCard' },
  { to: '/app/reports', kn: 'ವರದಿಗಳು', en: 'Reports', hint: 'ಸೇವಾವಾರು ವರದಿ', icon: 'chart' },
  { to: '/app/wallet', kn: 'ವಾಲೆಟ್', en: 'Wallet & top-up', hint: 'ಬ್ಯಾಲೆನ್ಸ್ ಮತ್ತು ಟಾಪ್-ಅಪ್', icon: 'wallet' },
  { to: '/app/applications', kn: 'ನನ್ನ ಅರ್ಜಿಗಳು', en: 'My applications', hint: 'ದೂರು / ವಿಮೆ / ತರಬೇತಿ ಸ್ಥಿತಿ', icon: 'inbox' },
  { to: '/app/tools/b2-photo', kn: 'B2 ಫೋಟೋ', en: 'B2 photo converter', hint: '2673 × 1890 px', icon: 'image' },
  { to: '/app/tools/passport-photo', kn: 'ಪಾಸ್‌ಪೋರ್ಟ್ ಫೋಟೋ', en: 'Passport photo', hint: '4×6 · 8 photos · 300 DPI', icon: 'portrait' },
];

const OPEN = ['SUBMITTED', 'UNDER_REVIEW', 'NEEDS_INFORMATION', 'REGISTERED', 'OPEN', 'IN_PROGRESS', 'WAITING_FOR_USER'];

export function DashboardPage() {
  const { user } = useAuth();
  const isOperator = user?.role === 'USER';
  const wallet = useWallet();
  const topups = useMyManualTopups(1);
  const apps = useMyApplications(isOperator);
  const news = usePublicAnnouncements();

  const pendingTopups = topups.data?.items.filter((t) => t.status === 'PENDING').length ?? 0;
  const recentDecided = topups.data?.items.find((t) => t.status !== 'PENDING');
  const allApps = apps.data ? [...apps.data.insurance, ...apps.data.membership, ...apps.data.training, ...apps.data.grievances] : [];
  const openApps = allApps.filter((a) => OPEN.includes(a.status)).length;
  const needsYou = allApps.filter((a) => a.status === 'WAITING_FOR_USER' || a.status === 'NEEDS_INFORMATION').length;

  return (
    <div>
      <div className="gold-rule mb-4" />
      <h1 className="font-display text-2xl text-navy-900">
        ನಮಸ್ಕಾರ, {user?.fullName?.split(' ')[0] ?? 'ಸಂಚಾಲಕರೇ'}
      </h1>
      <p className="mt-1 text-slate2">Welcome back. Choose a task to get started.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Link to="/app/wallet" className="tile tile-dark">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-navy-100">ವಾಲೆಟ್ ಬ್ಯಾಲೆನ್ಸ್ · Wallet balance</p>
              <p className="mt-1 font-display text-3xl font-bold">{wallet.data ? formatPaise(wallet.data.balancePaise) : '…'}</p>
            </div>
            <span className="tile-open"><Icons.chevron /></span>
          </div>
          <p className="mt-3 text-xs text-gold-300">
            {pendingTopups > 0
              ? `${pendingTopups} UPI ಟಾಪ್-ಅಪ್ ಪರಿಶೀಲನೆಯಲ್ಲಿ · awaiting admin`
              : recentDecided
                ? `ಕೊನೆಯ ಟಾಪ್-ಅಪ್: ${recentDecided.status === 'APPROVED' ? 'ಅನುಮೋದಿತ ✓' : 'ತಿರಸ್ಕೃತ'} · ${formatDate(recentDecided.reviewedAt ?? recentDecided.createdAt)}`
                : 'ಹಣ ಸೇರಿಸಲು ಒತ್ತಿ · Tap to add money'}
          </p>
        </Link>
        {isOperator && (
          <Link to="/app/applications" className="tile">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate2">ನನ್ನ ಅರ್ಜಿಗಳು · My applications</p>
                <p className="mt-1 font-display text-3xl font-bold text-navy-900">{apps.data ? openApps : '…'}</p>
              </div>
              <span className="tile-open"><Icons.chevron /></span>
            </div>
            <p className={`mt-3 text-xs ${needsYou ? 'font-semibold text-amber-700' : 'text-slate2'}`}>
              {needsYou ? `${needsYou} ನಿಮ್ಮ ಉತ್ತರಕ್ಕೆ ಕಾಯುತ್ತಿದೆ · need your reply` : 'ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿ · in progress'}
            </p>
          </Link>
        )}
        {/* information, not a button → flat panel with a real link inside */}
        <div className="info-panel">
          <p className="text-sm text-slate2">ಇತ್ತೀಚಿನ ಪ್ರಕಟಣೆ · Latest notice</p>
          {news.data?.[0] ? (
            <>
              <p className="mt-1 font-display text-navy-900">{news.data[0].title}</p>
              {(news.data[0].publishAt ?? news.data[0].createdAt) && (
                <p className="mt-1 text-xs text-slate2">{formatDate((news.data[0].publishAt ?? news.data[0].createdAt)!)}</p>
              )}
              <Link to="/announcements" className="link mt-2 inline-block text-sm text-navy-700">ಎಲ್ಲಾ ಪ್ರಕಟಣೆಗಳು ಓದಿ · Read all notices</Link>
            </>
          ) : (
            <p className="mt-1 text-sm text-slate2">—</p>
          )}
        </div>
      </div>

      <h2 className="mt-10 font-display text-lg text-navy-900">ಕೆಲಸಗಳು · Tasks</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map((t) => (
          <ActionTile key={t.to} to={t.to} icon={t.icon} title={t.kn} subtitle={t.en} detail={t.hint} />
        ))}
      </div>
    </div>
  );
}
