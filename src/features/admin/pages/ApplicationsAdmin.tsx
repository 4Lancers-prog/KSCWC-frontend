// ApplicationsAdmin.tsx — insurance / membership / training / grievance queues + status updates.
import { useState } from 'react';
import { Button, Select, Table, Th, Td, Pagination, Spinner, Alert } from '@/components/ui';
import { useAdminApplications, useApplicationStatus } from '../admin.api';
import { formatDate } from '@/lib/format';

const KINDS = [
  { key: 'insurance', kn: 'ವಿಮೆ', statuses: ['SUBMITTED', 'UNDER_REVIEW', 'NEEDS_INFORMATION', 'APPROVED', 'REJECTED', 'COMPLETED'] },
  { key: 'membership', kn: 'ಸದಸ್ಯತ್ವ', statuses: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'] },
  { key: 'training', kn: 'ತರಬೇತಿ', statuses: ['REGISTERED', 'CONFIRMED', 'ATTENDED', 'CANCELLED'] },
  { key: 'grievances', kn: 'ದೂರುಗಳು', statuses: ['OPEN', 'IN_PROGRESS', 'WAITING_FOR_USER', 'RESOLVED', 'CLOSED'] },
];

const LABEL: Record<string, string> = {
  insurance: 'customerName', membership: 'operatorName', training: 'name', grievances: 'name',
};

export function ApplicationsAdmin() {
  const [kindIdx, setKindIdx] = useState(0);
  const [page, setPage] = useState(1);
  const kind = KINDS[kindIdx] ?? KINDS[0]!;
  const { data, isLoading } = useAdminApplications(kind.key, page);
  const setStatus = useApplicationStatus(kind.key);

  return (
    <div>
      <div className="gold-rule mb-3" />
      <h1 className="font-display text-2xl text-navy-900">ಅರ್ಜಿಗಳು</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {KINDS.map((k, i) => (
          <button key={k.key} onClick={() => { setKindIdx(i); setPage(1); }}
            className={`rounded-full px-4 py-1.5 text-sm ${i === kindIdx ? 'bg-navy-600 text-white' : 'bg-white ring-1 ring-line'}`}>
            {k.kn}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {isLoading ? <div className="grid place-items-center py-16"><Spinner className="h-7 w-7 text-navy-500" /></div> : !data || data.total === 0 ? (
          <div className="rounded-xl2 border border-dashed border-line bg-white p-10 text-center text-slate2">—</div>
        ) : (
          <>
            {setStatus.isError && <div className="mb-3"><Alert tone="error">ಸ್ಥಿತಿ ಬದಲಾವಣೆ ವಿಫಲ.</Alert></div>}
            <Table>
              <thead><tr><Th>ಅರ್ಜಿದಾರ</Th><Th>ದಿನಾಂಕ</Th><Th>ಸ್ಥಿತಿ</Th></tr></thead>
              <tbody>
                {data.items.map((row) => {
                  const r = row as Record<string, string>;
                  return (
                    <tr key={r.id}>
                      <Td className="text-navy-900">
                        {r[LABEL[kind.key] ?? ''] ?? '—'}
                        {r.ticketCode && <div className="text-xs text-slate2">{r.ticketCode}</div>}
                        {r.phoneNormalized && <div className="text-xs text-slate2">{r.phoneNormalized}</div>}
                      </Td>
                      <Td>{r.createdAt ? formatDate(r.createdAt) : '—'}</Td>
                      <Td>
                        <Select value={r.status} onChange={(e) => setStatus.mutate({ id: r.id ?? '', status: e.target.value })} className="w-44">
                          {kind.statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                        </Select>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
