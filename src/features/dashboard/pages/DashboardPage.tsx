// DashboardPage.tsx — operator landing. Summary tiles are placeholders until Phase 2 wires data.
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const TILES = [
  { to: '/app/customers', kn: 'ಗ್ರಾಹಕರು', en: 'Customers', hint: 'ದಾಖಲೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ' },
  { to: '/app/reports', kn: 'ವರದಿಗಳು', en: 'Reports', hint: 'ಸೇವಾವಾರು ವರದಿ' },
  { to: '/app/wallet', kn: 'ವಾಲೆಟ್', en: 'Wallet', hint: 'ಬ್ಯಾಲೆನ್ಸ್ ಮತ್ತು ಟಾಪ್-ಅಪ್' },
  { to: '/app/fid', kn: 'ಎಫ್‌ಐಡಿ ಕಾರ್ಡ್', en: 'FID card', hint: '₹5 ಪ್ರತಿ ಕಾರ್ಡ್' },
  { to: '/app/tools/b2-photo', kn: 'B2 ಫೋಟೋ', en: 'B2 photo converter', hint: '2673 × 1890 px' },
  { to: '/app/tools/passport-photo', kn: 'ಪಾಸ್‌ಪೋರ್ಟ್ ಫೋಟೋ', en: 'Passport photo', hint: '4×6 · 8 photos · 300 DPI' },
];

export function DashboardPage() {
  const { user } = useAuth();
  return (
    <div>
      <div className="gold-rule mb-4" />
      <h1 className="font-display text-2xl text-navy-900">
        ನಮಸ್ಕಾರ, {user?.fullName?.split(' ')[0] ?? 'ಸಂಚಾಲಕರೇ'}
      </h1>
      <p className="mt-1 text-slate2">Welcome back. Choose a task to get started.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TILES.map((t, i) => (
          <Link
            key={t.to}
            to={t.to}
            style={{ animationDelay: `${i * 50}ms` }}
            className="hover-lift animate-fade-up rounded-xl2 border border-line bg-white p-5 shadow-card"
          >
            <p className="font-display text-lg text-navy-900">{t.kn}</p>
            <p className="text-sm text-slate2">{t.en}</p>
            <p className="mt-3 text-xs text-slate2">{t.hint}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
