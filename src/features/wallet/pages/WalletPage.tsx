// WalletPage.tsx — balance, UPI/QR top-up (verified by an admin before credit),
// the ledger, and the user's manual top-up request history.
import { useState, type FormEvent } from 'react';
import { Button, Input, Table, Th, Td, Pagination, Spinner, Alert } from '@/components/ui';
import { cn } from '@/lib/cn';
import {
  useWallet, useTransactions,
  usePaymentQr, usePaymentQrImage, useMyManualTopups, useSubmitManualTopup,
  type ManualTopup,
} from '../wallet.api';
import { rupeesToPaise } from '@/lib/money';
import { formatPaise, formatDate } from '@/lib/format';
import { useAuth } from '@/hooks/useAuth';
import { ApiClientError } from '@/lib/api-client';
import type { WalletTxn } from '@/types/entities';

const TX_LABEL: Record<WalletTxn['type'], string> = {
  TOPUP: 'ಟಾಪ್-ಅಪ್',
  CARD_CHARGE: 'ಕಾರ್ಡ್ ಶುಲ್ಕ',
  REFUND: 'ಮರುಪಾವತಿ',
  ADMIN_CREDIT: 'ನಿರ್ವಾಹಕ ಕ್ರೆಡಿಟ್',
  ADMIN_DEBIT: 'ನಿರ್ವಾಹಕ ಡೆಬಿಟ್',
  REVERSAL: 'ರಿವರ್ಸಲ್',
};

const STATUS: Record<ManualTopup['status'], { kn: string; cls: string }> = {
  PENDING: { kn: 'ಪರಿಶೀಲನೆಯಲ್ಲಿ', cls: 'bg-amber-100 text-amber-800' },
  APPROVED: { kn: 'ಅನುಮೋದಿತ', cls: 'bg-green-100 text-green-800' },
  REJECTED: { kn: 'ತಿರಸ್ಕೃತ', cls: 'bg-red-100 text-red-700' },
};

export function WalletPage() {
  const { user } = useAuth();
  const wallet = useWallet();
  const [page, setPage] = useState(1);
  const txns = useTransactions(page);

  return (
    <div>
      <div className="gold-rule mb-3" />
      <h1 className="font-display text-2xl text-navy-900">ವಾಲೆಟ್</h1>
      <p className="text-sm text-slate2">Wallet balance, top-up and transaction history</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          {/* balance */}
          <div className="rounded-xl2 border border-line bg-white p-6 shadow-card">
            <p className="text-sm text-slate2">ಲಭ್ಯ ಬ್ಯಾಲೆನ್ಸ್ · Available balance</p>
            <p className="mt-1 font-display text-4xl text-navy-900">
              {wallet.isLoading ? '…' : formatPaise(wallet.data?.balancePaise ?? 0)}
            </p>
          </div>

          {/* top-up: pay to the QR, then submit the UTR for admin verification */}
          <div className="rounded-xl2 border border-line bg-white p-6 shadow-card">
            <UpiTopup />
          </div>
        </div>

        {/* ledger */}
        <div>
          {txns.isLoading ? (
            <div className="grid place-items-center py-16"><Spinner className="h-7 w-7 text-navy-500" /></div>
          ) : !txns.data || txns.data.total === 0 ? (
            <div className="rounded-xl2 border border-dashed border-line bg-white p-10 text-center text-slate2">
              ಇನ್ನೂ ಯಾವುದೇ ವಹಿವಾಟುಗಳಿಲ್ಲ · No transactions yet.
            </div>
          ) : (
            <>
              <Table>
                <thead>
                  <tr><Th>ಬಗೆ · Type</Th><Th>ಮೊತ್ತ</Th><Th>ಬ್ಯಾಲೆನ್ಸ್</Th><Th>ದಿನಾಂಕ</Th></tr>
                </thead>
                <tbody>
                  {txns.data.items.map((t) => (
                    <tr key={t.id}>
                      <Td className="text-navy-900">{TX_LABEL[t.type]}</Td>
                      <Td>
                        <span className={t.direction === 'CREDIT' ? 'text-success' : 'text-danger'}>
                          {t.direction === 'CREDIT' ? '+' : '−'}{formatPaise(t.amountPaise)}
                        </span>
                      </Td>
                      <Td>{formatPaise(t.balanceAfterPaise)}</Td>
                      <Td>{formatDate(t.createdAt)}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Pagination page={txns.data.page} totalPages={txns.data.totalPages} total={txns.data.total} onChange={setPage} />
            </>
          )}
        </div>
      </div>

      <MyManualTopups />
    </div>
  );
}

// ── UPI / QR flow: pay to the council QR, then declare the UTR for admin verification ──
function UpiTopup() {
  const qr = usePaymentQr();
  const qrImage = usePaymentQrImage(qr.isSuccess);
  const submit = useSubmitManualTopup();
  const [rupees, setRupees] = useState('');
  const [utr, setUtr] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [err, setErr] = useState<string | null>(null);

  if (qr.isLoading) return <div className="py-6 text-center"><Spinner className="mx-auto h-6 w-6 text-navy-500" /></div>;
  if (qr.isError) {
    return <Alert tone="info">UPI ಪಾವತಿ ಇನ್ನೂ ಲಭ್ಯವಿಲ್ಲ · UPI payment isn’t set up yet. The council will publish the payment QR soon — please check back later.</Alert>;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    const amount = Number(rupees);
    if (!amount || amount <= 0) return setErr('ಮಾನ್ಯ ಮೊತ್ತ ನಮೂದಿಸಿ · Enter a valid amount');
    if (!/^[A-Za-z0-9]{10,24}$/.test(utr.trim())) return setErr('ಮಾನ್ಯ UTR / UPI ರೆಫರೆನ್ಸ್ ನಮೂದಿಸಿ · Enter the 12-digit UTR from your UPI app');
    const form = new FormData();
    form.append('amountPaise', String(rupeesToPaise(amount)));
    form.append('utrNumber', utr.trim());
    if (file) form.append('screenshot', file);
    try {
      await submit.mutateAsync(form);
      setRupees(''); setUtr(''); setFile(null);
    } catch {
      /* global error toast already fired */
    }
  };

  return (
    <div>
      <div className="flex flex-col items-center gap-2 rounded-lg bg-mist p-4 text-center">
        {qrImage.isLoading ? (
          <div className="grid h-44 w-44 place-items-center"><Spinner className="h-6 w-6 text-navy-500" /></div>
        ) : qrImage.data ? (
          <img src={qrImage.data} alt="UPI QR" className="h-44 w-44 rounded-lg bg-white object-contain p-2 ring-1 ring-line" />
        ) : (
          <div className="grid h-44 w-44 place-items-center text-xs text-slate2">QR unavailable</div>
        )}
        <p className="font-display text-navy-900">{qr.data!.payeeName}</p>
        <p className="select-all text-sm text-slate2">{qr.data!.upiId}</p>
        {qr.data!.note && <p className="text-xs text-slate2">{qr.data!.note}</p>}
      </div>

      <ol className="mt-4 list-decimal space-y-1 pl-5 text-xs text-slate2">
        <li>ಮೇಲಿನ QR ಅನ್ನು ನಿಮ್ಮ UPI ಆ್ಯಪ್‌ನಲ್ಲಿ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಪಾವತಿಸಿ.</li>
        <li>ಪಾವತಿಯ ನಂತರ ಸಿಗುವ 12-ಅಂಕಿಯ UTR ಸಂಖ್ಯೆ ಮತ್ತು ಮೊತ್ತವನ್ನು ಕೆಳಗೆ ನಮೂದಿಸಿ.</li>
        <li>ನಿರ್ವಾಹಕರು ಪರಿಶೀಲಿಸಿದ ನಂತರ ಮೊತ್ತ ನಿಮ್ಮ ವಾಲೆಟ್‌ಗೆ ಜಮೆಯಾಗುತ್ತದೆ.</li>
      </ol>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        {err && <Alert tone="error">{err}</Alert>}
        <div>
          <label htmlFor="upi-amt" className="text-sm font-medium text-navy-900">ಮೊತ್ತ (₹) · Amount paid</label>
          <Input id="upi-amt" inputMode="decimal" placeholder="500" value={rupees} onChange={(e) => setRupees(e.target.value)} />
        </div>
        <div>
          <label htmlFor="upi-utr" className="text-sm font-medium text-navy-900">UTR / UPI ರೆಫರೆನ್ಸ್ ಸಂಖ್ಯೆ</label>
          <Input id="upi-utr" placeholder="123456789012" value={utr} onChange={(e) => setUtr(e.target.value)} />
        </div>
        <div>
          <label htmlFor="upi-shot" className="text-sm font-medium text-navy-900">ಪಾವತಿ ಸ್ಕ್ರೀನ್‌ಶಾಟ್ (ಐಚ್ಛಿಕ)</label>
          <input
            id="upi-shot" type="file" accept="image/png,image/jpeg"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-1 block w-full text-sm text-slate2 file:mr-3 file:rounded-md file:border-0 file:bg-navy-600 file:px-3 file:py-1.5 file:text-white hover:file:bg-navy-700"
          />
        </div>
        <Button type="submit" loading={submit.isPending} className="w-full">ವಿನಂತಿ ಸಲ್ಲಿಸಿ · Submit for verification</Button>
      </form>
    </div>
  );
}

// ── The user's own UPI top-up requests ──
function MyManualTopups() {
  const [page, setPage] = useState(1);
  const q = useMyManualTopups(page);
  if (!q.data || q.data.total === 0) return null;
  return (
    <div className="mt-8">
      <div className="gold-rule mb-3" />
      <h2 className="font-display text-lg text-navy-900">UPI ಟಾಪ್-ಅಪ್ ವಿನಂತಿಗಳು · My UPI top-up requests</h2>
      <div className="mt-3">
        <Table>
          <thead>
            <tr><Th>ದಿನಾಂಕ</Th><Th>ಮೊತ್ತ</Th><Th>UTR</Th><Th>ಸ್ಥಿತಿ</Th><Th>ಟಿಪ್ಪಣಿ</Th></tr>
          </thead>
          <tbody>
            {q.data.items.map((r) => (
              <tr key={r.id}>
                <Td>{formatDate(r.createdAt)}</Td>
                <Td>{formatPaise(r.creditedAmountPaise ?? r.amountPaise)}</Td>
                <Td className="font-mono text-xs">{r.utrNumber}</Td>
                <Td>
                  <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', STATUS[r.status].cls)}>
                    {STATUS[r.status].kn}
                  </span>
                </Td>
                <Td className="text-xs text-slate2">{r.reviewNote ?? '—'}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Pagination page={q.data.page} totalPages={q.data.totalPages} total={q.data.total} onChange={setPage} />
      </div>
    </div>
  );
}
