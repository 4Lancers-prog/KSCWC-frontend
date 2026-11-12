// FidHistoryPage.tsx — past FID generations with free re-download.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, Th, Td, Pagination, Spinner, Alert } from '@/components/ui';
import { StatusBadge } from '@/components/layout/StatusBadge';
import { useFidHistory } from '../fid.api';
import { OfficialPortalCard } from '../components/OfficialPortalCard';
import { downloadFile } from '@/lib/download';
import { formatPaise, formatDate } from '@/lib/format';
import type { FidGeneration } from '@/types/entities';

const tone: Record<FidGeneration['status'], 'success' | 'danger' | 'warning' | 'info'> = {
  SUCCEEDED: 'success',
  FAILED: 'danger',
  PROCESSING: 'info',
  QUEUED: 'warning',
};

export function FidHistoryPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useFidHistory(page);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <div className="gold-rule mb-3" />
          <h1 className="font-display text-2xl text-navy-900">ಎಫ್‌ಐಡಿ ಇತಿಹಾಸ</h1>
          <p className="text-sm text-slate2">FID generation history</p>
        </div>
        <Link to="/app/fid" className="text-sm font-medium text-navy-600 hover:underline">+ ಹೊಸ ಕಾರ್ಡ್</Link>
      </div>

      <div className="mt-5"><OfficialPortalCard /></div>

      <div className="mt-6">
        {isLoading ? (
          <div className="grid place-items-center py-16"><Spinner className="h-7 w-7 text-navy-500" /></div>
        ) : isError || !data ? (
          <Alert tone="error">ಲೋಡ್ ಆಗಲಿಲ್ಲ · Could not load history.</Alert>
        ) : data.total === 0 ? (
          <div className="rounded-xl2 border border-dashed border-line bg-white p-12 text-center text-slate2">
            ಇನ್ನೂ ಯಾವುದೇ ಕಾರ್ಡ್‌ಗಳಿಲ್ಲ · No cards generated yet.
          </div>
        ) : (
          <>
            <Table>
              <thead>
                <tr><Th>ದಿನಾಂಕ</Th><Th>ಸ್ಥಿತಿ</Th><Th>ಶುಲ್ಕ</Th><Th> </Th></tr>
              </thead>
              <tbody>
                {data.items.map((g) => (
                  <tr key={g.id}>
                    <Td className="text-navy-900">{formatDate(g.createdAt)}</Td>
                    <Td><StatusBadge label={g.status} tone={tone[g.status]} /></Td>
                    <Td>{formatPaise(g.chargePaise)}</Td>
                    <Td>
                      {g.status === 'SUCCEEDED' ? (
                        <button className="font-medium text-navy-600 hover:underline"
                          onClick={() => downloadFile(`/fid-generations/${g.id}/download`, `fid-${g.id}.pdf`)}>
                          ಡೌನ್‌ಲೋಡ್ (ಉಚಿತ)
                        </button>
                      ) : <span className="text-slate2">—</span>}
                    </Td>
                  </tr>
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
