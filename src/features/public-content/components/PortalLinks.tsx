// PortalLinks.tsx — official government portals as big, obviously-clickable tiles that open the
// portal in a new tab. Used on the operator dashboard, the operator "Govt portals" page and the
// public links page. Links come from the admin-managed list (https only).
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { groupByCategory } from '@/lib/categories';
import { useCategories } from '../public-content.api';
import { Icons, buttonClass } from '@/components/ui';
import type { GovLink } from '@/types/entities';

function hostOf(url: string) {
  try { return new URL(url).host.replace(/^www\./, ''); } catch { return url; }
}

function PortalBadge({ link }: { link: GovLink }) {
  return link.imageUrl ? (
    <img src={link.imageUrl} alt="" loading="lazy" decoding="async"
      className="h-12 w-12 shrink-0 rounded-xl border border-line bg-white object-contain p-0.5" />
  ) : (
    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-700">
      <Icons.landmark />
    </span>
  );
}

export function PortalTile({ link, compact }: { link: GovLink; compact?: boolean }) {
  const [kn, ...rest] = link.title.split(' · ');
  const en = rest.join(' · ');
  // Visitors: the server sends no address — the tile leads to login, then to the portals page.
  if (!link.url) {
    return (
      <Link to="/login" state={{ from: '/app/portals' }} className="tile group !p-4"
        aria-label={`${link.title} — log in to open`}>
        <div className="flex items-start gap-3">
          <PortalBadge link={link} />
          <div className="min-w-0 flex-1">
            <p className="font-display leading-snug text-navy-900">{kn}</p>
            {en && <p className="text-sm font-medium leading-snug text-navy-700">{en}</p>}
            {!compact && link.description && <p className="mt-0.5 text-sm text-slate2">{link.description}</p>}
            <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
              ಪ್ರವೇಶಿಸಿ ತೆರೆಯಿರಿ · Log in to open
            </p>
          </div>
          <span className="tile-open" title="Log in to open"><Icons.lock /></span>
        </div>
      </Link>
    );
  }
  return (
    <a href={link.url} target="_blank" rel="noopener noreferrer" className="tile group !p-4"
      aria-label={`${link.title} — opens the official site in a new tab`}>
      <div className="flex items-start gap-3">
        <PortalBadge link={link} />
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
export function PortalGroups({ links: all, wide }: { links: GovLink[]; wide?: boolean }) {
  const { isAuthenticated } = useAuth();
  // Logged in: never offer "log in" again — a link without an address just isn't shown.
  const links = isAuthenticated ? all.filter((l) => l.url) : all;
  const locked = !isAuthenticated && links.some((l) => !l.url);
  const cats = useCategories('LINKS');
  const { groups, orphans } = groupByCategory(links, cats.data, (l) => l.categoryId);
  const Grid = ({ items }: { items: GovLink[] }) => (
    <div className={`mt-3 grid gap-3 sm:grid-cols-2 ${wide ? 'lg:grid-cols-3' : '2xl:grid-cols-3'}`}>
      {items.map((l) => <PortalTile key={l.id} link={l} />)}
    </div>
  );
  return (
    <div className="space-y-8">
      {locked && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl2 border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-900">
            🔒 ಪೋರ್ಟಲ್‌ಗಳನ್ನು ತೆರೆಯಲು ಸಂಚಾಲಕರು ಪ್ರವೇಶಿಸಬೇಕು · Registered operators can open these portals after logging in.
          </p>
          <Link to="/login" state={{ from: '/app/portals' }} className={buttonClass('primary', 'sm')}>ಪ್ರವೇಶ · Log in</Link>
        </div>
      )}
      {groups.map((g) => (
        <section key={g.cat.id}>
          <h2 className="font-display text-lg text-navy-900">{g.cat.nameKn}{g.cat.nameEn && <span className="text-slate2"> · {g.cat.nameEn}</span>}</h2>
          {g.direct.length > 0 && <Grid items={g.direct} />}
          {g.subs.map((s) => (
            <div key={s.cat.id} className="mt-5 border-l-4 border-gold-400 pl-4">
              <h3 className="font-medium text-navy-800">{s.cat.nameKn}{s.cat.nameEn && <span className="text-slate2"> · {s.cat.nameEn}</span>}</h3>
              <Grid items={s.items} />
            </div>
          ))}
        </section>
      ))}
      {orphans.length > 0 && (
        <section>
          <h2 className="font-display text-lg text-navy-900">ಇತರೆ <span className="text-slate2">· Other</span></h2>
          <Grid items={orphans} />
        </section>
      )}
      <p className="text-xs text-slate2">
        ↗ ಅಧಿಕೃತ ಸರ್ಕಾರಿ ತಾಣಗಳು ಹೊಸ ಟ್ಯಾಬ್‌ನಲ್ಲಿ ತೆರೆಯುತ್ತವೆ · Official government sites open in a new tab. Always check the
        address ends in <b>.gov.in</b> before entering a citizen’s details.
      </p>
    </div>
  );
}
