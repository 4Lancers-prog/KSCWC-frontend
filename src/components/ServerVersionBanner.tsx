// ServerVersionBanner.tsx — admin-only warning when the live server (Railway) is older than this
// website, e.g. because the latest backend deploy failed. Without it, the only symptom is
// features failing with "route not found".
import { useQuery } from '@tanstack/react-query';
import { Alert } from '@/components/ui';

/** The server version this website needs (matches API_VERSION in the backend's config/version.ts). */
export const REQUIRED_API_VERSION = 20261118;

export function ServerVersionBanner() {
  const { data } = useQuery({
    queryKey: ['server-version'],
    queryFn: async () => {
      const res = await fetch('/api/v1/version', { credentials: 'include', headers: { Accept: 'application/json' } });
      if (res.status === 404) return 0; // older servers have no version endpoint at all
      if (!res.ok) return null;          // server down/other problem: other screens report that
      return ((await res.json()) as { api?: number }).api ?? 0;
    },
    staleTime: 5 * 60_000,
    retry: false,
  });
  if (data === undefined || data === null || data >= REQUIRED_API_VERSION) return null;
  return (
    <div className="container-content pt-4">
      <Alert tone="error" title="ಸರ್ವರ್ ಹಳೆಯ ಆವೃತ್ತಿ · The server is out of date">
        The website was updated, but the server (Railway) is still running an older version, so some
        features will fail. Open Railway → kscwc-backend → Deployments: the latest deploy has probably
        failed — check its Deploy Logs. (Server version {data || 'unknown'}, website needs {REQUIRED_API_VERSION}.)
      </Alert>
    </div>
  );
}
