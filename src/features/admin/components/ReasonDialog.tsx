// ReasonDialog.tsx — modal that collects a required (or optional) note before an admin action.
// Replaces window.prompt, which is easy to dismiss by accident and is blocked in some browsers.
import { useEffect, useState } from 'react';
import { Modal, Button, Alert } from '@/components/ui';

export function ReasonDialog({
  open,
  title,
  description,
  confirmLabel,
  danger,
  required = true,
  minLength = 3,
  busy,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  danger?: boolean;
  required?: boolean;
  minLength?: number;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [text, setText] = useState('');
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    if (open) { setText(''); setErr(null); }
  }, [open]);

  const submit = () => {
    const v = text.trim();
    if (required && v.length < minLength) return setErr(`ಕನಿಷ್ಠ ${minLength} ಅಕ್ಷರಗಳು · At least ${minLength} characters`);
    onConfirm(v);
  };

  return (
    <Modal open={open} onClose={onCancel} title={title}>
      {description && <p className="mb-3 text-sm text-slate2">{description}</p>}
      {err && <div className="mb-3"><Alert tone="error">{err}</Alert></div>}
      <textarea
        autoFocus
        rows={4}
        maxLength={500}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={required ? 'ಕಾರಣ · Reason (the user will see this)' : 'ಟಿಪ್ಪಣಿ (ಐಚ್ಛಿಕ) · Note (optional)'}
        className="w-full rounded-lg border border-line px-3 py-2 text-sm text-navy-900 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-100"
      />
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>ರದ್ದು · Cancel</Button>
        <Button variant={danger ? 'danger' : 'primary'} loading={busy} onClick={submit}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
