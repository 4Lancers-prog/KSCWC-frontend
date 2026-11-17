// ManualTopups.tsx — admin: publish the payment QR, and verify UPI top-up requests
// (approve → credits the wallet through the audited ledger; reject → records a reason).
import { Fragment, useState, type FormEvent } from 'react';
import { Button, Input, Select, Table, Th, Td, Pagination, Spinner, Alert } from '@/components/ui';
import { cn } from '@/lib/cn';
import {
  useAdminManualTopups, useManualTopupReview, usePaymentQrConfig, useSetPaymentQr,
  type AdminManualTopup,
} from '../admin.api';
import { usePaymentQrImage } from '@/features/wallet/wallet.api';
import { formatPaise, formatDate } from '@/lib/format';
import { rupeesToPaise } from '@/lib/money';

const BASE = import.meta.env.VITE_API_BASE_URL ?? '';
const STATUS: Record<AdminManualTopup['status'], { kn: string; cls: string }> = {
  PENDING: { kn: 'ಪರಿಶೀಲನೆಯಲ್ಲಿ', cls: 'bg-amber-100 text-amber-800' },
  APPROVED: { kn: 'ಅನುಮೋದಿತ', cls: 'bg-green-100 text-green-800' },
  REJECTED: { kn: 'ತಿರಸ್ಕೃತ', cls: 'bg-red-100 text-red-700' },
};

export function ManualTopups() {
  const [status, setStatus] = useState('PENDING');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminManualTopups(status, page);
  const review = useManualTopupReview();
  const [open, setOpen] = useState<string | null>(null);
  const [amt, setAmt] = useState('');
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const reset = () => { setAmt(''); setNote(''); setReason(''); setErr(null); };

  const approve = async (r: AdminManualTopup) => {
    setErr(null);
    const override = amt.trim() ? rupeesToPaise(Number(amt)) : undefined;
    if (amt.trim() && (!override || override <= 0)) return setErr('ಮಾನ್ಯ ಮೊತ್ತ ನಮೂದಿಸಿ');
    await review.approve.mutateAsync({ id: r.id, amountPaise: override, note: note.trim() || undefined });
    setOpen(null); reset();
  };
  const reject = async (r: AdminManualTopup) => {
    setErr(null);
    if (reason.trim().length < 3) return setErr('ತಿರಸ್ಕಾರಕ್ಕೆ ಕಾರಣ ನಮೂದಿಸಿ');
    await review.reject.mutateAsync({ id: r.id, reason: reason.trim() });
    setOpen(null); reset();
  };

  return (
    <div>
      <div className="gold-rule mb-3" />
      <h1 className="font-display text-2xl text-navy-900">UPI ಟಾಪ್-ಅಪ್‌ಗಳು</h1>
      <p className="text-sm text-slate2">Publish the payment QR and verify UPI top-ups. Approvals credit the wallet and are audited.</p>

      <QrConfigCard />

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-lg text-navy-900">ವಿನಂತಿಗಳು · Requests</h2>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-44">
          <option value="PENDING">ಪರಿಶೀಲನೆಯಲ್ಲಿ · Pending</option>
          <option value="APPROVED">ಅನುಮೋದಿತ · Approved</option>
          <option value="REJECTED">ತಿರಸ್ಕೃತ · Rejected</option>
          <option value="">ಎಲ್ಲಾ · All</option>
        </Select>
      </div>

      <div className="mt-3">
        {isLoading ? (
          <div className="grid place-items-center py-16"><Spinner className="h-7 w-7 text-navy-500" /></div>
        ) : !data || data.total === 0 ? (
          <div className="rounded-xl2 border border-dashed border-line bg-white p-10 text-center text-slate2">ಯಾವುದೇ ವಿನಂತಿಗಳಿಲ್ಲ · No requests.</div>
        ) : (
          <>
            <Table>
              <thead>
                <tr><Th>ದಿನಾಂಕ</Th><Th>ಬಳಕೆದಾರ</Th><Th>ಮೊತ್ತ</Th><Th>UTR</Th><Th>ಸ್ಥಿತಿ</Th><Th> </Th></tr>
              </thead>
              <tbody>
                {data.items.map((r) => (
                  <Fragment key={r.id}>
                    <tr>
                      <Td className="whitespace-nowrap text-xs">{formatDate(r.createdAt)}</Td>
                      <Td className="text-navy-900">{r.user.fullName}<div className="text-xs text-slate2">{r.user.phone}</div></Td>
                      <Td>{formatPaise(r.creditedAmountPaise ?? r.amountPaise)}</Td>
                      <Td className="font-mono text-xs">
                        {r.utrNumber}
                        {r.hasScreenshot && (
                          <a href={`${BASE}/api/v1/admin/manual-topups/${r.id}/screenshot`} target="_blank" rel="noreferrer"
                            className="ml-2 text-navy-600 underline">ಸ್ಕ್ರೀನ್‌ಶಾಟ್</a>
                        )}
                      </Td>
                      <Td><span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', STATUS[r.status].cls)}>{STATUS[r.status].kn}</span></Td>
                      <Td>
                        {r.status === 'PENDING' ? (
                          <Button size="sm" variant="secondary" onClick={() => { setOpen(open === r.id ? null : r.id); reset(); }}>ಪರಿಶೀಲಿಸಿ</Button>
                        ) : (
                          <span className="text-xs text-slate2">{r.reviewNote ?? '—'}</span>
                        )}
                      </Td>
                    </tr>
                    {open === r.id && r.status === 'PENDING' && (
                      <tr>
                        <Td colSpan={6} className="bg-mist">
                          {err && <div className="mb-2"><Alert tone="error">{err}</Alert></div>}
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-lg border border-line bg-white p-3">
                              <p className="mb-2 text-sm font-semibold text-navy-900">ಅನುಮೋದಿಸಿ · Approve &amp; credit</p>
                              <p className="mb-2 text-xs text-slate2">ವಿನಂತಿ: {formatPaise(r.amountPaise)}. ಬ್ಯಾಂಕ್‌ನಲ್ಲಿ ಬೇರೆ ಮೊತ್ತ ಬಂದಿದ್ದರೆ ಕೆಳಗೆ ತಿದ್ದಿ.</p>
                              <div className="flex flex-wrap items-center gap-2">
                                <Input className="w-28" placeholder={`₹ ${formatPaise(r.amountPaise).replace('₹', '')}`} value={amt} onChange={(e) => setAmt(e.target.value)} />
                                <Input className="w-40" placeholder="ಟಿಪ್ಪಣಿ (ಐಚ್ಛಿಕ)" value={note} onChange={(e) => setNote(e.target.value)} />
                                <Button size="sm" loading={review.approve.isPending} onClick={() => approve(r)}>ಅನುಮೋದಿಸಿ</Button>
                              </div>
                            </div>
                            <div className="rounded-lg border border-line bg-white p-3">
                              <p className="mb-2 text-sm font-semibold text-navy-900">ತಿರಸ್ಕರಿಸಿ · Reject</p>
                              <div className="flex flex-wrap items-center gap-2">
                                <Input className="w-56" placeholder="ಕಾರಣ · Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
                                <Button size="sm" variant="danger" loading={review.reject.isPending} onClick={() => reject(r)}>ತಿರಸ್ಕರಿಸಿ</Button>
                              </div>
                            </div>
                          </div>
                        </Td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </Table>
            <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}

// ── Payment QR configuration ──
function QrConfigCard() {
  const qr = usePaymentQrConfig();
  const qrImage = usePaymentQrImage(!!qr.data);
  const save = useSetPaymentQr();
  const [upiId, setUpiId] = useState('');
  const [payeeName, setPayeeName] = useState('');
  const [note, setNote] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Prefill once config loads.
  const current = qr.data;
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    const upi = upiId.trim() || current?.upiId || '';
    const name = payeeName.trim() || current?.payeeName || '';
    if (upi.length < 3 || name.length < 2) return setErr('UPI ID ಮತ್ತು ಹೆಸರು ನಮೂದಿಸಿ');
    if (!current && !file) return setErr('QR ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ');
    const form = new FormData();
    form.append('upiId', upi);
    form.append('payeeName', name);
    if (note.trim() || current?.note) form.append('note', note.trim() || current?.note || '');
    if (file) form.append('image', file);
    await save.mutateAsync(form);
    setFile(null);
  };

  return (
    <div className="mt-6 rounded-xl2 border border-line bg-white p-6 shadow-card">
      <p className="font-display text-navy-900">ಪಾವತಿ QR · Payment QR</p>
      <p className="text-sm text-slate2">ಬಳಕೆದಾರರು ಈ QR ಅನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಪಾವತಿಸುತ್ತಾರೆ.</p>
      <div className="mt-4 grid gap-6 sm:grid-cols-[180px_1fr]">
        <div className="grid place-items-center rounded-lg bg-mist p-3">
          {qr.isSuccess && qrImage.data ? (
            <img src={qrImage.data} alt="Current QR" className="h-40 w-40 rounded bg-white object-contain p-1 ring-1 ring-line" />
          ) : (
            <span className="text-xs text-slate2">ಇನ್ನೂ ಹೊಂದಿಸಿಲ್ಲ · Not set</span>
          )}
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          {err && <Alert tone="error">{err}</Alert>}
          <Input placeholder={current ? `UPI ID (${current.upiId})` : 'UPI ID (name@bank)'} value={upiId} onChange={(e) => setUpiId(e.target.value)} />
          <Input placeholder={current ? `ಪಾವತಿದಾರರ ಹೆಸರು (${current.payeeName})` : 'ಪಾವತಿದಾರರ ಹೆಸರು · Payee name'} value={payeeName} onChange={(e) => setPayeeName(e.target.value)} />
          <Input placeholder={current?.note ?? 'ಟಿಪ್ಪಣಿ (ಐಚ್ಛಿಕ) · Note (optional)'} value={note} onChange={(e) => setNote(e.target.value)} />
          <input type="file" accept="image/png,image/jpeg" onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate2 file:mr-3 file:rounded-md file:border-0 file:bg-navy-600 file:px-3 file:py-1.5 file:text-white hover:file:bg-navy-700" />
          <Button type="submit" loading={save.isPending}>{current ? 'ನವೀಕರಿಸಿ · Update QR' : 'ಉಳಿಸಿ · Save QR'}</Button>
        </form>
      </div>
    </div>
  );
}
