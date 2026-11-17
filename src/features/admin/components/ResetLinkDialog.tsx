// ResetLinkDialog.tsx — admin creates a one-time password reset link and sends it to the operator.
import { useEffect, useState } from 'react';
import { Alert, Button, Modal, Spinner } from '@/components/ui';
import { api, ApiClientError } from '@/lib/api-client';
import { formatDate } from '@/lib/format';

type Target = { id: string; fullName: string; phoneNormalized: string };

export function ResetLinkDialog({ user, onClose }: { user: Target | null; onClose: () => void }) {
  const [state, setState] = useState<{ link: string; expiresAt: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    setState(null); setErr(null); setCopied(false);
    api<{ link: string; expiresAt: string }>(`/admin/users/${user.id}/password-reset-link`, { method: 'POST' })
      .then(setState)
      .catch((e) => setErr(e instanceof ApiClientError ? e.message : 'Could not create the link'));
  }, [user]);

  const message = state && user
    ? `ನಮಸ್ಕಾರ ${user.fullName}, KSCWC ಪಾಸ್‌ವರ್ಡ್ ಬದಲಿಸಲು ಈ ಲಿಂಕ್ ತೆರೆಯಿರಿ (24 ಗಂಟೆ ಮಾನ್ಯ): ${state.link}`
    : '';
  const wa = user ? `https://wa.me/91${user.phoneNormalized}?text=${encodeURIComponent(message)}` : '#';

  return (
    <Modal open={!!user} onClose={onClose} title="ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಕೆ ಲಿಂಕ್ · Password reset link">
      {user && <p className="mb-3 text-sm text-slate2">{user.fullName} · {user.phoneNormalized}</p>}
      {err && <Alert tone="error">{err}</Alert>}
      {!state && !err && <div className="grid place-items-center py-6"><Spinner className="h-6 w-6 text-navy-500" /></div>}
      {state && (
        <div className="space-y-3">
          <p className="break-all rounded-lg bg-mist p-3 font-mono text-xs text-navy-900">{state.link}</p>
          <p className="text-xs text-slate2">ಒಮ್ಮೆ ಮಾತ್ರ ಬಳಸಬಹುದು · Works once, until {formatDate(state.expiresAt)}. Send it only to this operator’s registered number.</p>
          <div className="flex flex-wrap gap-2">
            <a href={wa} target="_blank" rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center rounded-lg border border-emerald-700 bg-emerald-600 px-4 pt-[9px] pb-[3px] text-sm font-semibold text-white shadow-[0_3px_0_0_#065f46] hover:bg-emerald-500">
              WhatsApp ಮೂಲಕ ಕಳುಹಿಸಿ · Send on WhatsApp
            </a>
            <Button size="sm" variant="secondary" onClick={async () => {
              try { await navigator.clipboard.writeText(message); setCopied(true); } catch { setCopied(false); }
            }}>{copied ? '✓ ನಕಲಿಸಲಾಗಿದೆ · Copied' : 'ಸಂದೇಶ ನಕಲಿಸಿ · Copy message'}</Button>
            <Button size="sm" variant="ghost" onClick={onClose}>ಮುಚ್ಚಿ · Close</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
