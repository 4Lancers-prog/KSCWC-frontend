// PortalLinks.tsx — official government portals as big, obviously-clickable tiles that open the
// portal in a new tab. Used on the operator dashboard, the operator "Govt portals" page and the
// public links page. Links come from the admin-managed list (https only).
import { Icons } from '@/components/ui';
import type { GovLink } from '@/types/entities';

const GROUPS: { key: NonNullable<GovLink['category']>; kn: string; en: string }[] = [
  { key: 'STATE', kn: 'ಕರ್ನಾಟಕ ಸರ್ಕಾರ', en: 'Government of Karnataka' },
  { key: 'CENTRAL', kn: 'ಭಾರತ ಸರ್ಕಾರ', en: 'Government of India' },
  { key: 'OTHER', kn: 'ಇತರೆ', en: 'Other' },
];

function hostOf(url: string) {
  try { return new URL(url).host.replace(/^www\./, ''); } catch { return url; }
}

export function PortalTile({ link, compact }: { link: GovLink; compact?: boolean }) {
  const [kn, ...rest] = link.title.split(' · ');
  const en = rest.join(' · ');
  return (
    <a href={link.url} target="_blank" rel="noopener noreferrer" className="tile group !p-4"
      aria-label={`${link.title} — opens the official site in a new tab`}>
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-700">
          <Icons.landmark />
        </span>
        <div className="min-w-0 flex-1">
          {/* "ಸೇವಾ ಸಿಂಧು · Seva Sindhu" → Kannada name on top, English below (no word-by-word wrapping) */}
          <p className="font-display leading-snug text-navy-900">{kn}</p>
          {en && <p className="text-sm font-medium leading-snug text-navy-700">{en}</p>}
          {!compact && link.description && <p className="mt-0.5 text-sm text-slate2">{link.description}</p>}
          {/* the real address, so operators can see it is the official .gov.in site */}
          <p className="mt-1 break-all text-xs text-slate2">{hostOf(link.url)}</p>
        </div>
        <span className="tile-open" title="Opens in a new tab"><Icons.external /></span>
      </div>
    </a>
  );
}

/** All active portals, grouped: Karnataka first, then Government of India. */
export function PortalGroups({ links, wide }: { links: GovLink[]; wide?: boolean }) {
  return (
    <div className="space-y-8">
      {GROUPS.map((g) => {
        const items = links.filter((l) => (l.category ?? 'OTHER') === g.key);
        if (!items.length) return null;
        return (
          <section key={g.key}>
            <h2 className="font-display text-lg text-navy-900">{g.kn} · <span className="text-slate2">{g.en}</span></h2>
            <div className={`mt-3 grid gap-3 sm:grid-cols-2 ${wide ? 'lg:grid-cols-3' : '2xl:grid-cols-3'}`}>
              {items.map((l) => <PortalTile key={l.id} link={l} />)}
            </div>
          </section>
        );
      })}
      <p className="text-xs text-slate2">
        ↗ ಅಧಿಕೃತ ಸರ್ಕಾರಿ ತಾಣಗಳು ಹೊಸ ಟ್ಯಾಬ್‌ನಲ್ಲಿ ತೆರೆಯುತ್ತವೆ · Official government sites open in a new tab. Always check the
        address ends in <b>.gov.in</b> before entering a citizen’s details.
      </p>
    </div>
  );
}
