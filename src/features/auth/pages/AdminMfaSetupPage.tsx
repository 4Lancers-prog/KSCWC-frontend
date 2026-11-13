// AdminMfaSetupPage.tsx — two-factor enrolment for admins. Shown when the API flags the session
// mfaSetupRequired (ADMIN_MFA_REQUIRED=true and the admin has not enrolled yet); until enrolment
// completes the API refuses every admin route, so without this page the console could never load.
import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { Button, Input, FormField, Alert, Spinner } from '@/components/ui';
import { Emblem } from '@/components/Emblem';
import { useAuth } from '@/hooks/useAuth';
import { api, ApiClientError } from '@/lib/api-client';

export function AdminMfaSetupPage() {
  const { user, isAuthenticated, isLoading, mfaSetupRequired, markMfaEnrolled, logout } = useAuth();
  const navigate = useNavigate();
  const [secret, setSecret] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isStaff = !!user && user.role !== 'USER';

  useEffect(() => {
    if (!isAuthenticated || !isStaff) return;
    let cancelled = false;
    api<{ secret: string; otpauthUrl: string }>('/auth/mfa/setup', { method: 'POST' })
      .then(async ({ secret: s, otpauthUrl }) => {
        if (cancelled) return;
        setSecret(s);
        setQr(await QRCode.toDataURL(otpauthUrl, { margin: 1, width: 220 }));
      })
      .catch((e) => !cancelled && setError(e instanceof ApiClientError ? e.message : 'Could not start setup.'));
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isStaff]);

  if (isLoading) {
    return <div className="grid min-h-screen place-items-center"><Spinner className="h-8 w-8 text-navy-500" /></div>;
  }
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (!isStaff) return <Navigate to="/app" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(code.trim())) return setError('6 ಅಂಕಿಯ ಕೋಡ್ ನಮೂದಿಸಿ · Enter the 6-digit code');
    setBusy(true);
    try {
      await api('/auth/mfa/confirm', { method: 'POST', body: { token: code.trim() } });
      markMfaEnrolled();
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not verify the code.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-navy-950 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl2 bg-white shadow-lift animate-fade-up">
        <div className="bg-navy-900 px-6 py-6 text-white">
          <div className="flex items-center gap-3">
            <Emblem size={40} />
            <div>
              <p className="font-display text-lg font-bold">ಎರಡು-ಹಂತದ ದೃಢೀಕರಣ</p>
              <p className="text-xs text-navy-100">Set up two-factor authentication to open the admin console</p>
            </div>
          </div>
          <div className="mt-4 h-[3px] w-14 rounded-full bg-gold-500" />
        </div>
        <form onSubmit={onSubmit} className="space-y-4 p-6">
          {!mfaSetupRequired && user?.mfaEnabled && (
            <Alert tone="info">ಈಗಾಗಲೇ ಸಕ್ರಿಯವಾಗಿದೆ · Two-factor is already enabled. Re-enrolling replaces your old code.</Alert>
          )}
          {error && <Alert tone="error">{error}</Alert>}
          <ol className="list-decimal space-y-1 pl-5 text-sm text-slate2">
            <li>Open Google Authenticator, Microsoft Authenticator or any TOTP app.</li>
            <li>Scan the QR code (or type the key below).</li>
            <li>Enter the 6-digit code the app shows.</li>
          </ol>
          <div className="grid place-items-center rounded-xl border border-line bg-mist p-4">
            {qr ? <img src={qr} alt="Authenticator QR code" width={220} height={220} /> : <Spinner className="h-7 w-7 text-navy-500" />}
          </div>
          {secret && (
            <p className="break-all rounded-lg bg-mist px-3 py-2 text-center font-mono text-sm tracking-wider text-navy-900">{secret}</p>
          )}
          <FormField id="mfa-code" label="ದೃಢೀಕರಣ ಕೋಡ್" helper="6-digit code" required>
            <Input id="mfa-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6}
              value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />
          </FormField>
          <Button type="submit" block loading={busy} disabled={!secret}>ದೃಢೀಕರಿಸಿ · Verify & continue</Button>
          <button type="button" className="w-full text-center text-sm text-navy-600 hover:underline"
            onClick={async () => { await logout(); navigate('/admin/login', { replace: true }); }}>
            ನಿರ್ಗಮನ · Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
