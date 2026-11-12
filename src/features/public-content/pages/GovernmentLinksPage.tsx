// GovernmentLinksPage.tsx — validated government service links.
import { PageIntro } from '@/components/layout/PageIntro';
import { Spinner, Alert } from '@/components/ui';
import { L, H } from '@/i18n';
import { usePublicGovLinks } from '../public-content.api';

export function GovernmentLinksPage() {
  const { data, isLoading, isError } = usePublicGovLinks();
  return (
    <PageIntro title={L.nav_links} subtitle={H.nav_links}>
      {isLoading ? (
        <div className="grid place-items-center py-16"><Spinner className="h-7 w-7 text-navy-500" /></div>
      ) : isError ? (
        <Alert tone="error">ಲೋಡ್ ಆಗಲಿಲ್ಲ · Could not load links.</Alert>
      ) : !data || data.length === 0 ? (
        <div className="rounded-xl2 border border-dashed border-line bg-mist p-10 text-center text-slate2">—</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.map((l) => (
            <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer"
              className="flex items-start gap-3 rounded-xl2 border border-line bg-white p-4 shadow-card hover:border-navy-300">
              <span className="mt-1 h-2 w-2 flex-none rounded-full bg-gold-500" aria-hidden />
              <span>
                <span className="block font-medium text-navy-900">{l.title}</span>
                {l.description && <span className="block text-sm text-slate2">{l.description}</span>}
              </span>
            </a>
          ))}
        </div>
      )}
    </PageIntro>
  );
}
