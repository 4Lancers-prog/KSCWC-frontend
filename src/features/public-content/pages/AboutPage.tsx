// AboutPage.tsx — council objectives, functions, operator-welfare demands, social services
// and organisational structure. Content reproduced from the approved prototype (Kannada-first).
import { PageIntro } from '@/components/layout/PageIntro';

type Card = { icon: string; kn: string; body: string };

const CORE: Card[] = [
  { icon: '⚖️', kn: 'ನಿರ್ವಾಹಕರ ಕಲ್ಯಾಣ ಮತ್ತು ಪ್ರತಿನಿಧಿತ್ವ', body: 'ಸೇವಾ ಕೇಂದ್ರಗಳ ನಿರ್ವಾಹಕರ ಹಕ್ಕುಗಳು, ನ್ಯಾಯಸಮ್ಮತ ಕಮಿಷನ್ ಮತ್ತು ಕಾರ್ಯನಿರ್ವಹಣೆಯ ಸಮಸ್ಯೆಗಳ ಕುರಿತು ಸಂಬಂಧಿತ ಕರ್ನಾಟಕ ರಾಜ್ಯದ ಇಲಾಖೆಗಳೊಂದಿಗೆ ಸಮನ್ವಯ ಸಾಧಿಸುವುದು.' },
  { icon: '🛠️', kn: 'ದೂರು ಪರಿಹಾರ ಮತ್ತು ಮಾರ್ಗದರ್ಶನ', body: 'ಸೇವಾ ಪೋರ್ಟಲ್‌ಗಳ ತಾಂತ್ರಿಕ ತೊಂದರೆಗಳು, ಅರ್ಜಿ ಸಲ್ಲಿಕೆಯ ಸಮಸ್ಯೆಗಳು, ಪಾವತಿ ವ್ಯತ್ಯಾಸಗಳು ಮತ್ತು ಸೇವಾ ನಿರ್ವಹಣೆಗೆ ಸಂಬಂಧಿಸಿದ ಸಮಸ್ಯೆಗಳಿಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡುವುದು.' },
  { icon: '🎓', kn: 'ತರಬೇತಿ ಮತ್ತು ಕೌಶಲ್ಯ ಅಭಿವೃದ್ಧಿ', body: 'ಸೇವಾ ಕೇಂದ್ರ ನಿರ್ವಾಹಕರಿಗಾಗಿ ತರಬೇತಿ, ಕಾರ್ಯಾಗಾರಗಳು, ತಾಂತ್ರಿಕ ಮಾಹಿತಿ ಹಂಚಿಕೆ ಮತ್ತು ಹೊಸ ಸೇವೆಗಳ ಕುರಿತು ಮಾರ್ಗದರ್ಶನ ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ಆಯೋಜಿಸುವುದು.' },
  { icon: '🤝', kn: 'ಪರಸ್ಪರ ಸಹಕಾರ ಮತ್ತು ಕಲ್ಯಾಣ', body: 'ನಿರ್ವಾಹಕರು ಮತ್ತು ಅವರ ಕುಟುಂಬಗಳಿಗೆ ಅಗತ್ಯ ಸಂದರ್ಭಗಳಲ್ಲಿ ಸಹಕಾರ, ಕಲ್ಯಾಣ ಮಾಹಿತಿ ಹಾಗೂ ನಿಯಮಾನುಸರಣೆಯ ಕುರಿತು ಮಾರ್ಗದರ್ಶನ ಒದಗಿಸುವುದು.' },
];

const PRIMARY: Card[] = [
  { icon: '🏛️', kn: 'ಏಕಗವಾಕ್ಷಿ ಇ-ಆಡಳಿತ ಸೇವೆ', body: 'ಸಾರ್ವಜನಿಕರು ವಿವಿಧ ಇಲಾಖೆಗಳ ಸೇವೆಗಳನ್ನು ಒಂದೇ ಸೂರಿನಡಿ ತ್ವರಿತವಾಗಿ ಮತ್ತು ಸುಲಭವಾಗಿ ಪಡೆಯಲು ಸಹಕರಿಸುವುದು.' },
  { icon: '🔎', kn: 'ಪಾರದರ್ಶಕ ಆಡಳಿತ', body: 'ಮಧ್ಯವರ್ತಿಗಳ ಹಾವಳಿಯನ್ನು ಕಡಿಮೆ ಮಾಡಿ, ಸರ್ಕಾರದ ಸೇವೆಗಳು ಕಟ್ಟಕಡೆಯ ಪ್ರಜೆಗೂ ನೇರವಾಗಿ ತಲುಪುವಂತೆ ಪಾರದರ್ಶಕತೆಗೆ ಉತ್ತೇಜನ ನೀಡುವುದು.' },
  { icon: '💻', kn: 'ಡಿಜಿಟಲ್ ಕ್ರಾಂತಿ ಮತ್ತು ಸಾಕ್ಷರತೆ', body: 'ಗ್ರಾಮೀಣ ಹಾಗೂ ಹಿಂದುಳಿದ ಪ್ರದೇಶಗಳಲ್ಲಿ ಆನ್‌ಲೈನ್ ಸೇವೆಗಳ ಬಳಕೆಯನ್ನು ಉತ್ತೇಜಿಸಿ ಡಿಜಿಟಲ್ ಅಂತರವನ್ನು ಕಡಿಮೆ ಮಾಡುವುದು.' },
  { icon: '🛡️', kn: 'ಆಪರೇಟರ್‌ಗಳ ಹಿತರಕ್ಷಣೆ', body: 'ಸೇವಾ ಕೇಂದ್ರಗಳ ನಿರ್ವಾಹಕರು (VLEs) ಮತ್ತು ಸಿಬ್ಬಂದಿಗೆ ಆರ್ಥಿಕ, ಸಾಮಾಜಿಕ ಹಾಗೂ ವೃತ್ತಿಪರ ಭದ್ರತೆ ದೊರಕಲು ಪ್ರಯತ್ನಿಸುವುದು.' },
];

const PUBLIC_SERVICES: Card[] = [
  { icon: '📄', kn: 'ಕಂದಾಯ ಮತ್ತು ಇ-ಆಡಳಿತ', body: 'ಜಾತಿ, ಆದಾಯ ಮತ್ತು ವಾಸಸ್ಥಳ ಪ್ರಮಾಣಪತ್ರಗಳು, ಪಹಣಿ (RTC), ಭೂ ದಾಖಲೆಗಳು ಹಾಗೂ ಇ-ಖಾತಾ ಸೇವೆಗಳಿಗಾಗಿ ಮಾರ್ಗದರ್ಶನ.' },
  { icon: '🤲', kn: 'ಕಲ್ಯಾಣ ಯೋಜನೆಗಳು', body: 'ಗ್ಯಾರಂಟಿ ಯೋಜನೆಗಳು, ವೃದ್ಧಾಪ್ಯ/ವಿಧವಾ/ಅಂಗವಿಕಲ ಮಾಸಾಶನ, ಆಯುಷ್ಮಾನ್ ಭಾರತ್ ಮತ್ತು ವಸತಿ ಯೋಜನೆಗಳ ಅರ್ಜಿ ಸಲ್ಲಿಕೆಗೆ ನೆರವು.' },
  { icon: '🪪', kn: 'ನಾಗರಿಕ ದಾಖಲಾತಿಗಳು', body: 'ಆಧಾರ್ ಸೇವೆಗಳು, ಮತದಾರರ ಗುರುತಿನ ಚೀಟಿ, ಹೊಸ ಪಡಿತರ ಚೀಟಿ ಅರ್ಜಿ ಹಾಗೂ ತಿದ್ದುಪಡಿ ಸೇವೆಗಳಿಗೆ ಮಾರ್ಗದರ್ಶನ.' },
  { icon: '💡', kn: 'ಉಪಯುಕ್ತತಾ ಸೇವೆಗಳು', body: 'ವಿದ್ಯುತ್, ನೀರು, ಆಸ್ತಿ ತೆರಿಗೆ ಮತ್ತು ವಿವಿಧ ಸರ್ಕಾರಿ ಶುಲ್ಕಗಳ ಪಾವತಿಗೆ ನೆರವು.' },
  { icon: '🏦', kn: 'ಮೈಕ್ರೋ-ಬ್ಯಾಂಕಿಂಗ್ ಮತ್ತು ವಿಮೆ', body: 'AEPS (ಆಧಾರ್ ಆಧಾರಿತ ಹಣ ವಿತರಣೆ), ಠೇವಣಿ ಹಾಗೂ ಕಿರು ವಿಮೆ ಸೌಲಭ್ಯಗಳ ಕುರಿತು ಮಾಹಿತಿ ಮತ್ತು ಮಾರ್ಗದರ್ಶನ.' },
];

const WELFARE: Card[] = [
  { icon: '🏥', kn: 'ಇ.ಎಸ್.ಐ (ESI) ಚಿಕಿತ್ಸಾ ಸೌಲಭ್ಯ', body: 'ಆಪರೇಟರ್‌ಗಳು ಮತ್ತು ಅವರ ಅವಲಂಬಿತ ಕುಟುಂಬದವರಿಗೆ ESI ಹಾಗೂ ನೆಟ್‌ವರ್ಕ್ ಆಸ್ಪತ್ರೆಗಳಲ್ಲಿ ಉಚಿತ ಚಿಕಿತ್ಸಾ ಸೌಲಭ್ಯ ಒದಗಿಸುವಂತೆ ಸರ್ಕಾರವನ್ನು ಒತ್ತಾಯಿಸುವುದು.' },
  { icon: '🛡️', kn: '₹5,00,000 ಅಪಘಾತ ವಿಮೆ', body: 'ಸಾರ್ವಜನಿಕ ಸೇವೆಯಲ್ಲಿ ನಿರತರಾಗಿರುವ ಆಪರೇಟರ್‌ಗಳಿಗೆ ಸರ್ಕಾರ ಅಥವಾ ಸಂಬಂಧಿತ ನಿಗಮದ ಮೂಲಕ ₹5 ಲಕ್ಷದವರೆಗೆ ಉಚಿತ ಅಪಘಾತ ಮತ್ತು ಜೀವ ವಿಮೆ ಒದಗಿಸುವಂತೆ ಮನವಿ ಮಾಡುವುದು.' },
  { icon: '💰', kn: 'ಕಡಿಮೆ ಬಡ್ಡಿದರದ ಸಾಲ', body: 'ಕಂಪ್ಯೂಟರ್, ಪ್ರಿಂಟರ್, ಬಯೋಮೆಟ್ರಿಕ್ ಸಾಧನಗಳ ಖರೀದಿ ಮತ್ತು ಕೇಂದ್ರದ ಉನ್ನತೀಕರಣಕ್ಕಾಗಿ ರಾಷ್ಟ್ರೀಕೃತ ಬ್ಯಾಂಕ್‌ಗಳು ಅಥವಾ ನಿಗಮಗಳ ಮೂಲಕ ಶೇ. 3–4 ರಿಯಾಯಿತಿ ಬಡ್ಡಿದರದ ಸಾಲ ಸೌಲಭ್ಯಕ್ಕಾಗಿ ಹಕ್ಕೊತ್ತಾಯ.' },
  { icon: '📈', kn: 'ಮಾಸಿಕ ಗೌರವಧನ / ಸೇವಾ ಶುಲ್ಕ', body: 'ಕಮಿಷನ್ ಆಧಾರಿತ ಆದಾಯದ ಜೊತೆಗೆ ಕನಿಷ್ಠ ಮಾಸಿಕ ಆರ್ಥಿಕ ಭದ್ರತೆ ಅಥವಾ ಸೇವಾ ಶುಲ್ಕ ಹೆಚ್ಚಳ ಕಲ್ಪಿಸುವಂತೆ ಸರ್ಕಾರದ ಗಮನ ಸೆಳೆಯುವುದು.' },
];

const SOCIAL: Card[] = [
  { icon: '🩸', kn: 'ರಕ್ತದಾನ ಶಿಬಿರಗಳು', body: 'ಜಿಲ್ಲಾ ಮತ್ತು ತಾಲ್ಲೂಕು ಮಟ್ಟದಲ್ಲಿ ಸ್ವಯಂಪ್ರೇರಿತ ರಕ್ತದಾನ ಶಿಬಿರಗಳನ್ನು ಆಯೋಜಿಸಿ ಸ್ಥಳೀಯ ರಕ್ತನಿಧಿಗಳಿಗೆ ಸಹಕಾರ ನೀಡುವುದು.' },
  { icon: '🩺', kn: 'ಉಚಿತ ಆರೋಗ್ಯ ತಪಾಸಣೆ', body: 'ಆಪರೇಟರ್‌ಗಳು, ಅವರ ಕುಟುಂಬದವರು ಮತ್ತು ಗ್ರಾಮಸ್ಥರಿಗೆ ಕಣ್ಣಿನ ತಪಾಸಣೆ, ಬಿಪಿ/ಶುಗರ್ ತಪಾಸಣೆ ಹಾಗೂ ಸಾಮಾನ್ಯ ಆರೋಗ್ಯ ಶಿಬಿರಗಳನ್ನು ಆಯೋಜಿಸುವುದು.' },
  { icon: '📱', kn: 'ಡಿಜಿಟಲ್ ಸಾಕ್ಷರತಾ ಅಭಿಯಾನ', body: 'ಗ್ರಾಮ ಪಂಚಾಯಿತಿ ಮಟ್ಟದಲ್ಲಿ ರೈತರು, ಮಹಿಳೆಯರು ಮತ್ತು ಹಿರಿಯ ನಾಗರಿಕರಿಗೆ ಮೊಬೈಲ್ ಬ್ಯಾಂಕಿಂಗ್ ಹಾಗೂ ಸೈಬರ್ ವಂಚನೆ ತಡೆ ಕುರಿತು ಜಾಗೃತಿ ಮೂಡಿಸುವುದು.' },
  { icon: '🤝', kn: 'ವಿಪತ್ತು ನಿರ್ವಹಣೆ ಮತ್ತು ಪರಿಹಾರ', body: 'ನೆರೆ, ಬರ ಅಥವಾ ನೈಸರ್ಗಿಕ ವಿಕೋಪಗಳ ಸಂದರ್ಭದಲ್ಲಿ ಪರಿಹಾರ ಸಾಮಗ್ರಿ ವಿತರಣೆ ಮತ್ತು ಪರಿಹಾರ ತಂತ್ರಾಂಶಗಳಲ್ಲಿ ಉಚಿತ ನೋಂದಣಿ ನೆರವು ನೀಡುವುದು.' },
  { icon: '🌱', kn: 'ಪರಿಸರ ಕಾಳಜಿ – ಹಸಿರು ಗ್ರಾಮ', body: 'ವಾರ್ಷಿಕೋತ್ಸವ ಅಥವಾ ವಿಶೇಷ ದಿನಗಳಂದು ಸರ್ಕಾರಿ ಶಾಲೆಗಳು ಮತ್ತು ಸಾರ್ವಜನಿಕ ಸ್ಥಳಗಳಲ್ಲಿ ಸಸಿ ನೆಡುವ ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ಆಯೋಜಿಸುವುದು.' },
];

const STRUCTURE: { level: string; scope: string }[] = [
  { level: 'ರಾಜ್ಯ ಮಟ್ಟ', scope: 'ಕರ್ನಾಟಕ ರಾಜ್ಯದ ಇಲಾಖೆಗಳೊಂದಿಗೆ ಸಮನ್ವಯ, ರಾಜ್ಯಮಟ್ಟದ ಸಮಸ್ಯೆಗಳ ಪ್ರತಿನಿಧಿತ್ವ ಮತ್ತು ಸೇವಾ ಕೇಂದ್ರಗಳ ಹಿತಾಸಕ್ತಿ ರಕ್ಷಣೆ.' },
  { level: 'ಜಿಲ್ಲಾ ಮಟ್ಟ', scope: 'ಜಿಲ್ಲೆಯ ಸೇವಾ ಕೇಂದ್ರ ನಿರ್ವಾಹಕರನ್ನು ಸಂಘಟಿಸುವುದು, ಸಭೆಗಳನ್ನು ಆಯೋಜಿಸುವುದು ಮತ್ತು ಸ್ಥಳೀಯ ಸಮಸ್ಯೆಗಳಿಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡುವುದು.' },
  { level: 'ತಾಲೂಕು ಮಟ್ಟ', scope: 'ತಾಲೂಕಿನ ನಿರ್ವಾಹಕರ ನಡುವೆ ಸಹಕಾರ ಹೆಚ್ಚಿಸುವುದು ಹಾಗೂ ಗ್ರಾಮ ಪಂಚಾಯಿತಿಗಳು ಮತ್ತು ಸ್ಥಳೀಯ ಕಚೇರಿಗಳೊಂದಿಗೆ ಸಮನ್ವಯ ಸಾಧಿಸುವುದು.' },
];

function Section({ no, title, en, cards }: { no?: string; title: string; en: string; cards: Card[] }) {
  return (
    <section className="mt-14">
      <div className="gold-rule mb-3" />
      <h2 className="font-display text-xl text-navy-900 sm:text-2xl">
        {no && <span className="text-gold-500">{no} </span>}
        {title}
      </h2>
      <p className="mt-1 text-sm text-slate2">{en}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.kn} className="rounded-xl2 border border-line bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
            <div className="text-2xl" aria-hidden>{c.icon}</div>
            <p className="mt-2 font-display text-navy-900">{c.kn}</p>
            <p className="mt-1 text-sm leading-relaxed text-slate2">{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AboutPage() {
  return (
    <PageIntro
      title="ಕರ್ನಾಟಕ ರಾಜ್ಯ ನಾಗರಿಕ ಸೇವಾ ಕೇಂದ್ರಗಳ ಕಲ್ಯಾಣ ಪರಿಷತ್"
      subtitle="About the Council — objectives, functions and welfare agenda"
    >
      <p className="max-w-3xl text-[15px] leading-relaxed text-slate2">
        ಕರ್ನಾಟಕ ರಾಜ್ಯದಾದ್ಯಂತ ನಾಗರಿಕರಿಗೆ ಡಿಜಿಟಲ್ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಸೇವೆಗಳನ್ನು ಒದಗಿಸುವ ಸೇವಾ ಕೇಂದ್ರಗಳ ನಿರ್ವಾಹಕರನ್ನು
        ಒಗ್ಗೂಡಿಸಿ, ಅವರ ಹಕ್ಕುಗಳು, ಕಲ್ಯಾಣ, ನ್ಯಾಯಸಮ್ಮತ ಸೇವಾ ಕಮಿಷನ್ ಮತ್ತು ಕಾರ್ಯನಿರ್ವಹಣೆಯ ಭದ್ರತೆಯನ್ನು ಬೆಂಬಲಿಸುವುದು
        ಈ ಪರಿಷತ್ತಿನ ಉದ್ದೇಶವಾಗಿದೆ.
      </p>

      <Section title="ಮುಖ್ಯ ಉದ್ದೇಶಗಳು ಮತ್ತು ಕಾರ್ಯಗಳು" en="Core mission and functions" cards={CORE} />
      <Section no="೧." title="ಕೇಂದ್ರಗಳ ಮುಖ್ಯ ಉದ್ದೇಶಗಳು" en="Primary objectives" cards={PRIMARY} />
      <Section no="೨." title="ಸಾರ್ವಜನಿಕ ಸೇವಾ ಕಾರ್ಯಗಳು" en="Public & citizen services" cards={PUBLIC_SERVICES} />
      <Section no="೩." title="ಆಪರೇಟರ್‌ಗಳ ಕ್ಷೇಮಾಭಿವೃದ್ಧಿ ಮತ್ತು ಹಕ್ಕೊತ್ತಾಯಗಳು" en="Operator welfare — the Council's demands to government" cards={WELFARE} />

      <p className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-inset ring-amber-100">
        ಸೂಚನೆ: ಮೇಲಿನ ವಿಮೆ, ಚಿಕಿತ್ಸಾ ಸೌಲಭ್ಯ, ಸಾಲ ಮತ್ತು ಗೌರವಧನದ ಅಂಶಗಳು ಪರಿಷತ್ತಿನ ಹಕ್ಕೊತ್ತಾಯಗಳು/ಉದ್ದೇಶಿತ
        ಬೇಡಿಕೆಗಳಾಗಿವೆ; ಈಗಾಗಲೇ ಮಂಜೂರಾದ ಸರ್ಕಾರಿ ಸೌಲಭ್ಯಗಳೆಂದು ಅರ್ಥೈಸಬಾರದು.
      </p>

      <Section no="೪." title="ಸಾಮಾಜಿಕ ಸೇವೆಗಳು ಮತ್ತು ಸಾಮುದಾಯಿಕ ಜವಾಬ್ದಾರಿಗಳು" en="Social & community responsibilities" cards={SOCIAL} />

      {/* Organisational structure */}
      <section className="mt-14">
        <div className="gold-rule mb-3" />
        <h2 className="font-display text-xl text-navy-900 sm:text-2xl">ಕರ್ನಾಟಕ ರಾಜ್ಯದ ಸಂಘಟನಾ ವ್ಯವಸ್ಥೆ</h2>
        <p className="mt-1 text-sm text-slate2">Organisational structure across Karnataka</p>
        <div className="mt-6 overflow-hidden rounded-xl2 border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy-900 text-white">
              <tr>
                <th className="w-40 px-4 py-3 font-display font-semibold">ಮಟ್ಟ</th>
                <th className="px-4 py-3 font-display font-semibold">ಕಾರ್ಯವ್ಯಾಪ್ತಿ</th>
              </tr>
            </thead>
            <tbody>
              {STRUCTURE.map((r, i) => (
                <tr key={r.level} className={i % 2 ? 'bg-mist' : 'bg-white'}>
                  <td className="px-4 py-3 align-top font-semibold text-navy-900">{r.level}</td>
                  <td className="px-4 py-3 align-top text-slate2">{r.scope}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 max-w-3xl rounded-lg border border-line bg-mist px-4 py-3 text-sm text-slate2">
        ಈ ಪರಿಷತ್ತು ಕರ್ನಾಟಕ ರಾಜ್ಯ ಮಟ್ಟದ ಸಂಘಟನೆಯಾಗಿದೆ. ಇದು ಸರ್ಕಾರಿ ಇಲಾಖೆಯಲ್ಲ; ಇಲ್ಲಿ ಉಲ್ಲೇಖಿಸಿರುವ ಉದ್ದೇಶಗಳು
        ಸೇವೆಗಳ ಲಭ್ಯತೆ ಅಥವಾ ಸರ್ಕಾರಿ ಮಾನ್ಯತೆಯ ಖಾತರಿಯಲ್ಲ.
      </p>
    </PageIntro>
  );
}
