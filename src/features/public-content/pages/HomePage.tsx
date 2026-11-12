// HomePage.tsx — public landing. Hero + capabilities + services + how-it-works + CTA.
import { Link } from 'react-router-dom';
import { L, H } from '@/i18n';
import { Emblem } from '@/components/Emblem';

const SERVICES: { kn: string; en: string }[] = [
  { kn: 'ಆಧಾರ್ ನವೀಕರಣ', en: 'Aadhaar update' },
  { kn: 'ಪ್ಯಾನ್ ಕಾರ್ಡ್', en: 'PAN card' },
  { kn: 'ಪಡಿತರ ಚೀಟಿ', en: 'Ration card' },
  { kn: 'ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ', en: 'Income certificate' },
  { kn: 'ಜಾತಿ ಪ್ರಮಾಣಪತ್ರ', en: 'Caste certificate' },
  { kn: 'ಎಫ್‌ಐಡಿ ಕಾರ್ಡ್', en: 'FID card' },
];

const CAPABILITIES = [
  { kn: 'ಗ್ರಾಹಕರ ದಾಖಲೆಗಳು', en: 'Customer records' },
  { kn: 'ಸೇವಾವಾರು ವರದಿಗಳು', en: 'Service-wise reports' },
  { kn: 'ಪ್ರಿಪೇಯ್ಡ್ ವಾಲೆಟ್', en: 'Prepaid wallet' },
  { kn: 'ಎಫ್‌ಐಡಿ ಕಾರ್ಡ್ ತಯಾರಿಕೆ', en: 'FID card generation' },
];

const STEPS = [
  { kn: 'ನೋಂದಣಿ ಮಾಡಿ', en: 'Register your centre' },
  { kn: 'ಅನುಮೋದನೆ ಪಡೆಯಿರಿ', en: 'Get admin approval' },
  { kn: 'ಸೇವೆ ಆರಂಭಿಸಿ', en: 'Start serving citizens' },
];

export function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-mist to-white">
        <div className="container-content grid items-center gap-10 py-14 lg:grid-cols-[1.4fr_1fr] lg:py-20">
          <div>
            <div className="gold-rule mb-5" />
            <h1 className="font-display text-3xl leading-tight text-navy-900 sm:text-4xl lg:text-[2.75rem]">
              {L.hero_title}
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate2">{L.hero_body}</p>
            <p className="mt-2 max-w-xl text-sm text-slate2/80">{H.hero_body}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="rounded-lg bg-navy-600 px-6 py-3 text-[15px] font-semibold text-white hover:bg-navy-700"
              >
                {L.hero_cta_primary}
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-white px-6 py-3 text-[15px] font-semibold text-navy-700 ring-1 ring-inset ring-line hover:bg-mist"
              >
                {L.hero_cta_secondary}
              </Link>
              <Link
                to="/about"
                className="rounded-lg px-6 py-3 text-[15px] font-semibold text-navy-700 underline-offset-4 hover:underline"
              >
                ಪರಿಷತ್ ಬಗ್ಗೆ ಇನ್ನಷ್ಟು →
              </Link>
            </div>
            <p className="mt-6 max-w-xl rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-inset ring-amber-100">
              {L.hero_note}
            </p>
          </div>

          {/* Capability panel, crowned by the emblem */}
          <div className="rounded-xl2 border border-line bg-white p-6 shadow-card">
            <div className="mb-4 flex flex-col items-center text-center">
              <Emblem size={84} />
            </div>
            <p className="font-display text-navy-900">ಸಂಚಾಲಕರಿಗೆ ಲಭ್ಯವಿರುವ ಸೌಲಭ್ಯಗಳು</p>
            <p className="text-sm text-slate2">What operators can do here</p>
            <ul className="mt-5 space-y-3">
              {CAPABILITIES.map((c) => (
                <li key={c.en} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 flex-none rounded-full bg-gold-500" aria-hidden />
                  <span>
                    <span className="block font-medium text-navy-900">{c.kn}</span>
                    <span className="block text-sm text-slate2">{c.en}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="container-content py-14">
        <div className="gold-rule mb-4" />
        <h2 className="font-display text-2xl text-navy-900">{L.services_title}</h2>
        <p className="mt-1 text-slate2">{L.services_body}</p>
        <div className="mt-8 grid gap-px overflow-hidden rounded-xl2 border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <div key={s.en} className="bg-white p-5">
              <p className="font-display text-lg text-navy-900">{s.kn}</p>
              <p className="text-sm text-slate2">{s.en}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works — a genuine sequence, so numbered markers are appropriate */}
      <section className="bg-mist py-14">
        <div className="container-content">
          <div className="gold-rule mb-4" />
          <h2 className="font-display text-2xl text-navy-900">ಹೇಗೆ ಆರಂಭಿಸುವುದು</h2>
          <p className="mt-1 text-slate2">Getting started in three steps</p>
          <ol className="mt-8 grid gap-6 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.en} className="rounded-xl2 bg-white p-6 shadow-card">
                <span className="font-display text-3xl text-gold-500">{i + 1}</span>
                <p className="mt-2 font-display text-lg text-navy-900">{step.kn}</p>
                <p className="text-sm text-slate2">{step.en}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-navy-900">
        <div className="container-content flex flex-col items-start gap-4 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl text-white">ನಿಮ್ಮ ಕೇಂದ್ರವನ್ನು ಇಂದೇ ನೋಂದಾಯಿಸಿ</h2>
            <p className="mt-1 text-navy-100">Register your service centre today.</p>
          </div>
          <Link
            to="/register"
            className="rounded-lg bg-gold-500 px-6 py-3 font-semibold text-navy-950 hover:bg-gold-400"
          >
            {L.hero_cta_secondary}
          </Link>
        </div>
      </section>
    </>
  );
}
