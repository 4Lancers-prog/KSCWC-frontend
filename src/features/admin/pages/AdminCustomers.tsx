// AdminCustomers.tsx — every operator's customer records in one place, with totals and CSV export.
// Click an operator's name to see only their records.
import { useState } from 'react';
import { Button, Input, Select, Table, Th, Td, Pagination, Spinner } from '@/components/ui';
import { StatusBadge } from '@/components/layout/StatusBadge';
import { formatDate, formatPaise } from '@/lib/format';
import { downloadFile } from '@/lib/download';
import { toast } from '@/lib/toast';
import { useServices } from '@/features/customers/customers.api';
import { adminCustomersCsvPath, useAdminCustomerReport, useAdminCustomers } from '../admin.api';

const STATUS = [
  ['PENDING', 'ಬಾಕಿ · Pending', 'warning'],
  ['IN_PROGRESS', 'ಪ್ರಗತಿಯಲ್ಲಿ · In progress', 'info'],
  ['COMPLETED', 'ಪೂರ್ಣ · Completed', 'success'],
  ['CANCELLED', 'ರದ್ದು · Cancelled', 'neutral'],
] as const;
const toneOf = (s: string) => (STATUS.find((x) => x[0] === s)?.[2] ?? 'neutral');
const labelOf = (s: string) => (STATUS.find((x) => x[0] === s)?.[1] ?? s);

export function AdminCustomers() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [search, setSearch] = useState('');
  const [owner, setOwner] = useState<{ id: string; name: string } | null>(null);
  const services = useServices();
  const scope = { status: status || undefined, serviceId: serviceId || undefined, ownerUserId: owner?.id };
  const list = useAdminCustomers({ page, search: search || undefined, ...scope });
  const report = useAdminCustomerReport(scope);
  const [exporting, setExporting] = useState(false);

  const reset = () => setPage(1);

  return (
    <div>
      <div className="gold-rule mb-3" />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-navy-900">ಗ್ರಾಹಕರು / ವರದಿ</h1>
          <p className="text-sm text-slate2">Customer records from all operators</p>
        </div>
        <Button variant="secondary" size="sm" loading={exporting}
          onClick={async () => {
            setExporting(true);
            try { await downloadFile(adminCustomersCsvPath(scope), `customers-${Date.now()}.csv`); }
            catch { toast('CSV ಡೌನ್‌ಲೋಡ್ ವಿಫಲ · Export failed', 'error'); }
            finally { setExporting(false); }
          }}>
          CSV ಡೌನ್‌ಲೋಡ್ · Export CSV
        </Button>
      </div>

      {report.data && (
        <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-xl2 border border-line bg-white p-4 shadow-card">
            <p className="text-xs text-slate2">ಒಟ್ಟು · Total</p>
            <p className="font-display text-2xl text-navy-900">{report.data.totals.total}</p>
            <p className="text-xs text-slate2">{formatPaise(report.data.totals.feeTotalPaise ?? 0)} fees</p>
          </div>
          {STATUS.map(([key, label]) => (
            <div key={key} className="rounded-xl2 border border-line bg-white p-4 shadow-card">
              <p className="text-xs text-slate2">{label}</p>
              <p className="font-display text-2xl text-navy-900">
                {report.data.byStatus.find((b) => b.status === key)?.count ?? 0}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <Input placeholder="ಗ್ರಾಹಕರ ಹೆಸರು / ಮೊಬೈಲ್ · Search customer" value={search} onChange={(e) => { setSearch(e.target.value); reset(); }} />
        <Select value={serviceId} onChange={(e) => { setServiceId(e.target.value); reset(); }}>
          <option value="">ಎಲ್ಲಾ ಸೇವೆಗಳು · All services</option>
          {services.data?.map((s) => <option key={s.id} value={s.id}>{s.nameKn}</option>)}
        </Select>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); reset(); }}>
          <option value="">ಎಲ್ಲಾ ಸ್ಥಿತಿ · All statuses</option>
          {STATUS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </Select>
      </div>
      {owner && (
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-navy-50 px-3 py-1 text-sm text-navy-800">
          ಸಂಚಾಲಕ · Operator: <b>{owner.name}</b>
          <button className="text-slate2 hover:text-navy-900" aria-label="Clear operator filter" onClick={() => { setOwner(null); reset(); }}>✕</button>
        </div>
      )}

      <div className="mt-5">
        {list.isLoading ? <div className="grid place-items-center py-16"><Spinner className="h-7 w-7 text-navy-500" /></div>
          : !list.data || list.data.total === 0 ? (
            <div className="rounded-xl2 border border-dashed border-line bg-white p-10 text-center text-slate2">ಯಾವುದೇ ದಾಖಲೆಗಳಿಲ್ಲ · No records.</div>
          ) : (
            <>
              <Table>
                <thead><tr><Th>ಗ್ರಾಹಕ · Customer</Th><Th>ಸೇವೆ · Service</Th><Th>ಸಂಚಾಲಕ · Operator</Th><Th>ಶುಲ್ಕ · Fee</Th><Th>ಸ್ಥಿತಿ</Th><Th>ದಿನಾಂಕ</Th></tr></thead>
                <tbody>
                  {list.data.items.map((c) => (
                    <tr key={c.id}>
                      <Td className="text-navy-900">{c.fullName}<div className="text-xs text-slate2">{c.mobileNormalized}{c.referenceCode ? ` · ${c.referenceCode}` : ''}</div></Td>
                      <Td>{c.service?.nameKn ?? '—'}</Td>
                      <Td>
                        {c.owner ? (
                          <button className="text-left text-navy-700 hover:underline" onClick={() => { setOwner({ id: c.owner!.id, name: c.owner!.fullName }); reset(); }}>
                            {c.owner.fullName}
                            <div className="text-xs text-slate2">{c.owner.centreName ?? c.owner.phoneNormalized}</div>
                          </button>
                        ) : '—'}
                      </Td>
                      <Td>{c.feePaise != null ? formatPaise(c.feePaise) : '—'}</Td>
                      <Td><StatusBadge label={labelOf(c.status)} tone={toneOf(c.status)} /></Td>
                      <Td className="whitespace-nowrap">{formatDate(c.createdAt)}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Pagination page={list.data.page} totalPages={list.data.totalPages} total={list.data.total} onChange={setPage} />
            </>
          )}
      </div>
    </div>
  );
}
