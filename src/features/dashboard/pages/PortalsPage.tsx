// PortalsPage.tsx — operator: every official government portal, grouped (inside the dashboard).
import { Spinner, Alert } from '@/components/ui';
import { usePublicGovLinks } from '@/features/public-content/public-content.api';
import { PortalGroups } from '@/features/public-content/components/PortalLinks';

export function PortalsPage() {
  const { data, isLoading, isError } = usePublicGovLinks();
  return (
    <div>
      <div className="gold-rule mb-4" />
      <h1 className="font-display text-2xl text-navy-900">ಸರ್ಕಾರಿ ಸೇವಾ ಪೋರ್ಟಲ್‌ಗಳು</h1>
      <p className="mt-1 text-slate2">Government service portals · ಒತ್ತಿದರೆ ಅಧಿಕೃತ ತಾಣ ಹೊಸ ಟ್ಯಾಬ್‌ನಲ್ಲಿ ತೆರೆಯುತ್ತದೆ</p>
      <div className="mt-6">
        {isLoading ? (
          <div className="grid place-items-center py-16"><Spinner className="h-7 w-7 text-navy-500" /></div>
        ) : isError ? (
          <Alert tone="error">ಲೋಡ್ ಆಗಲಿಲ್ಲ · Could not load portals.</Alert>
        ) : !data?.length ? (
          <div className="info-panel text-center text-slate2">ಇನ್ನೂ ಯಾವುದೇ ಪೋರ್ಟಲ್ ಇಲ್ಲ · No portals yet — the admin can add them.</div>
        ) : (
          <PortalGroups links={data} />
        )}
      </div>
    </div>
  );
}
