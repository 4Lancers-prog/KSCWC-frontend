// CustomerDetailPage.tsx — customer details, status history, and a status-change control.
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Select, Input, Alert, Spinner } from '@/components/ui';
import { StatusBadge } from '@/components/layout/StatusBadge';
import { useCustomer, useChangeStatus } from '../customers.api';
import { customerStatusMeta, nextStatuses } from '@/lib/status';
import { formatDate, formatPaise } from '@/lib/format';
import type { CustomerStatus } from '@/types/entities';
import { ApiClientError } from '@/lib/api-client';

export function CustomerDetailPage() {
  const { id } = useParams();
  const { data, isLoading, isError } = useCustomer(id);
  const changeStatus = useChangeStatus(id ?? '');
  const [next, setNext] = useState<CustomerStatus | ''>('');
  const [reason, setReason] = useState('');
  const [err, setErr] = useState<string | null>(null);

  if (isLoading) return <div className="grid place-items-center py-16"><Spinner className="h-7 w-7 text-navy-500" /></div>;
  if (isError || !data) return <Alert tone="error">ಗ್ರಾಹಕ ಕಂಡುಬಂದಿಲ್ಲ · Customer not found.</Alert>;

  const { customer, history } = data;
  const meta = customerStatusMeta[customer.status];
  const options = nextStatuses[customer.status];

  const applyStatus = async () => {
    if (!next) return;
    setErr(null);
    try {
      await changeStatus.mutateAsync({ status: next, reason: reason || undefined });
      setNext('');
      setReason('');
    } catch (e) {
      setErr(e instanceof ApiClientError ? e.message : 'Could not change status.');
    }
  };

  return (
    <div className="max-w-3xl">
      <Link to="/app/customers" className="text-sm font-medium text-navy-600 hover:underline">← ಪಟ್ಟಿಗೆ</Link>
      <div className="mt-3 flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-navy-900">{customer.fullName}</h1>
        <StatusBadge label={`${meta.kn} · ${meta.en}`} tone={meta.tone} />
      </div>

      <dl className="mt-6 grid gap-4 rounded-xl2 border border-line bg-white p-5 sm:grid-cols-2">
        <Field label="ಮೊಬೈಲ್ · Mobile" value={customer.mobileNormalized} />
        <Field label="ಸೇವೆ · Service" value={customer.service?.nameKn ?? '—'} />
        <Field label="ಉಲ್ಲೇಖ · Reference" value={customer.referenceCode ?? '—'} />
        <Field label="ಶುಲ್ಕ · Fee" value={customer.feePaise != null ? formatPaise(customer.feePaise) : '—'} />
        <Field label="ರಚಿಸಿದ · Created" value={formatDate(customer.createdAt)} />
        <Field label="ಟಿಪ್ಪಣಿ · Notes" value={customer.notes ?? '—'} />
      </dl>

      <div className="mt-4 flex gap-3">
        <Link to={`/app/customers/${customer.id}/edit`}
          className="inline-flex h-10 items-center rounded-lg px-4 text-sm text-navy-700 ring-1 ring-inset ring-line hover:bg-mist">
          ಸಂಪಾದಿಸಿ · Edit
        </Link>
      </div>

      {/* status change */}
      {options.length > 0 && (
        <section className="mt-8 rounded-xl2 border border-line bg-white p-5">
          <h2 className="font-display text-lg text-navy-900">ಸ್ಥಿತಿ ಬದಲಾಯಿಸಿ · Change status</h2>
          {err && <div className="mt-3"><Alert tone="error">{err}</Alert></div>}
          <div className="mt-4 grid gap-3 sm:grid-cols-[200px_1fr_auto]">
            <Select value={next} onChange={(e) => setNext(e.target.value as CustomerStatus)}>
              <option value="">— ಆಯ್ಕೆಮಾಡಿ —</option>
              {options.map((s) => (
                <option key={s} value={s}>{customerStatusMeta[s].kn} · {customerStatusMeta[s].en}</option>
              ))}
            </Select>
            <Input placeholder="ಕಾರಣ (ಐಚ್ಛಿಕ) · Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
            <Button onClick={applyStatus} loading={changeStatus.isPending} disabled={!next}>ಅನ್ವಯಿಸಿ</Button>
          </div>
        </section>
      )}

      {/* history */}
      <section className="mt-8">
        <h2 className="font-display text-lg text-navy-900">ಸ್ಥಿತಿ ಇತಿಹಾಸ · Status history</h2>
        <ol className="mt-4 space-y-3 border-l-2 border-line pl-5">
          {history.map((h) => (
            <li key={h.id} className="relative">
              <span className="absolute -left-[23px] top-1.5 h-2.5 w-2.5 rounded-full bg-gold-500" aria-hidden />
              <p className="text-sm text-navy-900">
                {h.oldStatus ? `${customerStatusMeta[h.oldStatus].en} → ` : ''}
                <strong>{customerStatusMeta[h.newStatus].en}</strong>
              </p>
              <p className="text-xs text-slate2">{formatDate(h.createdAt)}{h.reason ? ` · ${h.reason}` : ''}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate2">{label}</dt>
      <dd className="mt-0.5 text-[15px] text-navy-900">{value}</dd>
    </div>
  );
}
