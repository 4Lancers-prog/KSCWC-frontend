// Settings.tsx — admin settings (server-enforced RBAC: settings:manage).
// Currently: the official FID portal link used by the operator FID pages.
import { useEffect, useState, type FormEvent } from 'react';
import { Button, Input, Alert, Spinner } from '@/components/ui';
import { useFidPortalLink, DEFAULT_FID_PORTAL_URL } from '@/features/fid/fid.api';
import { useSetFidPortalLink } from '../admin.api';

export function Settings() {
  const link = useFidPortalLink();
  const save = useSetFidPortalLink();
  const [url, setUrl] = useState('');
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (link.data?.url) setUrl(link.data.url);
  }, [link.data?.url]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    const v = url.trim();
    if (!/^https?:\/\/.+/i.test(v)) return setErr('http:// ಅಥವಾ https:// ನಿಂದ ಆರಂಭವಾಗುವ ಮಾನ್ಯ URL ನಮೂದಿಸಿ');
    await save.mutateAsync(v);
  };

  return (
    <div>
      <div className="gold-rule mb-3" />
      <h1 className="font-display text-2xl text-navy-900">ಸೆಟ್ಟಿಂಗ್‌ಗಳು · Settings</h1>
      <p className="text-sm text-slate2">Portal configuration</p>

      <div className="mt-6 max-w-2xl rounded-xl2 border border-line bg-white p-6 shadow-card">
        <p className="font-display text-navy-900">ಅಧಿಕೃತ ಎಫ್‌ಐಡಿ ಪೋರ್ಟಲ್ ಲಿಂಕ್ · Official FID portal link</p>
        <p className="mt-1 text-sm text-slate2">
          ಎಫ್‌ಐಡಿ ಪುಟಗಳಲ್ಲಿ “ಪೋರ್ಟಲ್ ತೆರೆಯಿರಿ” ಈ ವಿಳಾಸಕ್ಕೆ ಕೊಂಡೊಯ್ಯುತ್ತದೆ. Operators are sent here to verify
          Aadhaar &amp; OTP on the government portal.
        </p>

        {link.isLoading ? (
          <div className="py-6"><Spinner className="mx-auto h-6 w-6 text-navy-500" /></div>
        ) : (
          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            {err && <Alert tone="error">{err}</Alert>}
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
            <div className="flex items-center gap-3">
              <Button type="submit" loading={save.isPending}>ಉಳಿಸಿ · Save</Button>
              <button
                type="button"
                className="text-sm text-navy-600 hover:underline"
                onClick={() => setUrl(DEFAULT_FID_PORTAL_URL)}
              >
                ಪೂರ್ವನಿಯೋಜಿತಕ್ಕೆ ಮರುಹೊಂದಿಸಿ · Reset to default
              </button>
            </div>
            <p className="break-all text-xs text-slate2">ಪೂರ್ವನಿಯೋಜಿತ: {DEFAULT_FID_PORTAL_URL}</p>
          </form>
        )}
      </div>
    </div>
  );
}
