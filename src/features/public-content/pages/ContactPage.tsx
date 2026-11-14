// ContactPage.tsx — static contact/help details.
import { Link } from 'react-router-dom';
import { Icons } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { PageIntro } from '@/components/layout/PageIntro';
import { L, H } from '@/i18n';

const FORMS = [
  { to: '/forms/membership', kn: 'ಸದಸ್ಯತ್ವ ಅರ್ಜಿ', en: 'Membership application' },
  { to: '/forms/insurance', kn: 'ವಾಹನ ವಿಮೆ ವಿನಂತಿ', en: 'Vehicle insurance request' },
  { to: '/forms/training', kn: 'ತರಬೇತಿ ನೋಂದಣಿ', en: 'Training registration' },
  { to: '/forms/grievance', kn: 'ದೂರು / ಸಲಹೆ', en: 'Grievance / suggestion' },
];

export function ContactPage() {
  const { isAuthenticated, user } = useAuth();
  const isOperator = user?.role === 'USER';
  return (
    <PageIntro title={L.nav_contact} subtitle={H.nav_contact}>
      <div className="max-w-prose space-y-3 text-slate2">
        <p>ಸಹಾಯಕ್ಕಾಗಿ ನಿಮ್ಮ ಜಿಲ್ಲಾ ಸಂಯೋಜಕರನ್ನು ಸಂಪರ್ಕಿಸಿ, ಅಥವಾ ಮಂಡಳಿಯ ಕಚೇರಿಗೆ ಬರೆಯಿರಿ.</p>
        <p className="text-sm">For help, contact your district coordinator or write to the Council office.</p>
      </div>

      <h2 className="mt-10 font-display text-xl text-navy-900">ಅರ್ಜಿಗಳು · Forms</h2>
      <p className="mt-1 text-sm text-slate2">
        {isOperator
          ? 'ನಿಮ್ಮ ಖಾತೆಯಿಂದ ಸಲ್ಲಿಸಿ · Submitted from your account — track them under “My applications”.'
          : 'ನೋಂದಾಯಿತ ಸಂಚಾಲಕರು ಪ್ರವೇಶಿಸಿ ಸಲ್ಲಿಸಬಹುದು · Registered operators can apply after logging in.'}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {FORMS.map((f) => (
          <Link key={f.to} to={f.to} className="tile !flex-row items-center gap-3 !p-4">
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-navy-900">{f.kn}</span>
              <span className="block text-sm text-slate2">{f.en}</span>
            </span>
            {!isAuthenticated && (
              <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
                ಪ್ರವೇಶ ಅಗತ್ಯ · Login needed
              </span>
            )}
            <span className="tile-open"><Icons.chevron /></span>
          </Link>
        ))}
      </div>
    </PageIntro>
  );
}
