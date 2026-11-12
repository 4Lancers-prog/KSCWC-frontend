// ContactPage.tsx — static contact/help details.
import { Link } from 'react-router-dom';
import { PageIntro } from '@/components/layout/PageIntro';
import { L, H } from '@/i18n';

const FORMS = [
  { to: '/forms/membership', kn: 'ಸದಸ್ಯತ್ವ ಅರ್ಜಿ', en: 'Membership application' },
  { to: '/forms/insurance', kn: 'ವಾಹನ ವಿಮೆ ವಿನಂತಿ', en: 'Vehicle insurance request' },
  { to: '/forms/training', kn: 'ತರಬೇತಿ ನೋಂದಣಿ', en: 'Training registration' },
  { to: '/forms/grievance', kn: 'ದೂರು / ಸಲಹೆ', en: 'Grievance / suggestion' },
];

export function ContactPage() {
  return (
    <PageIntro title={L.nav_contact} subtitle={H.nav_contact}>
      <div className="max-w-prose space-y-3 text-slate2">
        <p>ಸಹಾಯಕ್ಕಾಗಿ ನಿಮ್ಮ ಜಿಲ್ಲಾ ಸಂಯೋಜಕರನ್ನು ಸಂಪರ್ಕಿಸಿ, ಅಥವಾ ಮಂಡಳಿಯ ಕಚೇರಿಗೆ ಬರೆಯಿರಿ.</p>
        <p className="text-sm">For help, contact your district coordinator or write to the Council office.</p>
      </div>

      <h2 className="mt-10 font-display text-xl text-navy-900">ಅರ್ಜಿಗಳು · Forms</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {FORMS.map((f) => (
          <Link key={f.to} to={f.to} className="flex items-center gap-3 rounded-xl2 border border-line bg-white p-4 shadow-card hover:border-navy-300">
            <span className="h-2 w-2 rounded-full bg-gold-500" aria-hidden />
            <span><span className="block font-medium text-navy-900">{f.kn}</span><span className="block text-sm text-slate2">{f.en}</span></span>
          </Link>
        ))}
      </div>
    </PageIntro>
  );
}
