// GovernmentLinksPage.tsx — official government portals (public), grouped by government.
import { PageIntro } from '@/components/layout/PageIntro';
import { Spinner, Alert } from '@/components/ui';
import { L, H } from '@/i18n';
import { usePublicGovLinks } from '../public-content.api';
import { PortalGroups } from '../components/PortalLinks';

export function GovernmentLinksPage() {
  const { data, isLoading, isError } = usePublicGovLinks();
  return (
    <PageIntro title={L.nav_links} subtitle={H.nav_links}>
      {isLoading ? (
        <div className="grid place-items-center py-16"><Spinner className="h-7 w-7 text-navy-500" /></div>
      ) : isError ? (
        <Alert tone="error">ಲೋಡ್ ಆಗಲಿಲ್ಲ · Could not load links.</Alert>
      ) : !data || data.length === 0 ? (
        <div className="info-panel text-center text-slate2">ಇನ್ನೂ ಯಾವುದೇ ಕೊಂಡಿಗಳಿಲ್ಲ · No links yet.</div>
      ) : (
        <PortalGroups links={data} wide />
      )}
    </PageIntro>
  );
}
