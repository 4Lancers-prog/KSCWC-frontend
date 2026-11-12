// AuditLogs.tsx — append-only audit trail viewer.
import { useState } from 'react';
import { Table, Th, Td, Pagination, Spinner, Alert } from '@/components/ui';
import { useAuditLogs } from '../admin.api';
import { formatDate } from '@/lib/format';

export function AuditLogs() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useAuditLogs(page);

  return (
    <div>
      <div className="gold-rule mb-3" />
      <h1 className="font-display text-2xl text-navy-900">ಆಡಿಟ್ ಲಾಗ್‌ಗಳು</h1>
      <p className="text-sm text-slate2">Append-only trail of privileged actions</p>

      <div className="mt-6">
        {isLoading ? <div className="grid place-items-center py-16"><Spinner className="h-7 w-7 text-navy-500" /></div> : isError || !data ? (
          <Alert tone="error">ಲೋಡ್ ಆಗಲಿಲ್ಲ.</Alert>
        ) : data.total === 0 ? (
          <div className="rounded-xl2 border border-dashed border-line bg-white p-10 text-center text-slate2">—</div>
        ) : (
          <>
            <Table>
              <thead><tr><Th>ಕ್ರಿಯೆ</Th><Th>ಘಟಕ</Th><Th>ದಿನಾಂಕ</Th></tr></thead>
              <tbody>
                {data.items.map((row) => {
                  const r = row as Record<string, string>;
                  return (
                    <tr key={r.id}>
                      <Td className="text-navy-900">{r.action}</Td>
                      <Td>{r.entityType}{r.entityId ? ` · ${String(r.entityId).slice(0, 8)}` : ''}</Td>
                      <Td>{r.createdAt ? formatDate(r.createdAt) : '—'}</Td>
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
