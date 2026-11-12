// ServicesPage.tsx — public services (static Phase-1 view; wired to API in a later phase).
import { PageIntro } from '@/components/layout/PageIntro';
import { L } from '@/i18n';

const SERVICES = [
  { kn: 'ಆಧಾರ್ ನವೀಕರಣ', en: 'Aadhaar update' },
  { kn: 'ಪ್ಯಾನ್ ಕಾರ್ಡ್', en: 'PAN card' },
  { kn: 'ಪಡಿತರ ಚೀಟಿ', en: 'Ration card' },
  { kn: 'ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ', en: 'Income certificate' },
  { kn: 'ಜಾತಿ ಪ್ರಮಾಣಪತ್ರ', en: 'Caste certificate' },
  { kn: 'ಎಫ್‌ಐಡಿ ಕಾರ್ಡ್', en: 'FID card' },
];

export function ServicesPage() {
  return (
    <PageIntro title={L.services_title} subtitle={L.services_body}>
      <div className="grid gap-px overflow-hidden rounded-xl2 border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => (
          <div key={s.en} className="bg-white p-5">
            <p className="font-display text-lg text-navy-900">{s.kn}</p>
            <p className="text-sm text-slate2">{s.en}</p>
          </div>
        ))}
      </div>
    </PageIntro>
  );
}
