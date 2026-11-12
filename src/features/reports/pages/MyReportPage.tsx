// MyReportPage.tsx — operator's own customer report (totals, by service, by status) + CSV.
import { Button, Table, Th, Td, Spinner, Alert } from '@/components/ui';
import { StatusBadge } from '@/components/layout/StatusBadge';
import { useMyReport } from '../reports.api';
import { customerStatusMeta } from '@/lib/status';
import { downloadFile } from '@/lib/download';
import { formatPaise } from '@/lib/format';
import type { CustomerStatus } from '@/types/entities';

export function MyReportPage() {
  const { data, isLoading, isError } = useMyReport();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="gold-rule mb-3" />
          <h1 className="font-display text-2xl text-navy-900">ನನ್ನ ವರದಿ</h1>
          <p className="text-sm text-slate2">My customer report</p>
        </div>
        <Button variant="secondary" onClick={() => downloadFile('/reports/export.csv', `my-report-${Date.now()}.csv`)}>
          CSV ಡೌನ್‌ಲೋಡ್
        </Button>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-16"><Spinner className="h-7 w-7 text-navy-500" /></div>
      ) : isError || !data ? (
        <div className="mt-6"><Alert tone="error">ವರದಿ ಲೋಡ್ ಆಗಲಿಲ್ಲ · Could not load the report.</Alert></div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Stat label="ಒಟ್ಟು ಗ್ರಾಹಕರು · Total customers" value={String(data.totals.total)} />
            <Stat label="ಪೂರ್ಣಗೊಂಡ · Completed" value={String(data.byStatus.find((s) => s.status === 'COMPLETED')?.count ?? 0)} />
            <Stat label="ಒಟ್ಟು ಶುಲ್ಕ · Total fee" value={formatPaise(data.totals.feeTotalPaise)} />
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <section>
              <h2 className="mb-3 font-display text-lg text-navy-900">ಸ್ಥಿತಿವಾರು · By status</h2>
              <div className="flex flex-wrap gap-2">
                {data.byStatus.map((s) => {
                  const meta = customerStatusMeta[s.status as CustomerStatus];
                  return (
                    <span key={s.status} className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm">
                      <StatusBadge label={meta.kn} tone={meta.tone} /> {s.count}
                    </span>
                  );
                })}
                {data.byStatus.length === 0 && <p className="text-sm text-slate2">—</p>}
              </div>
            </section>

            <section>
              <h2 className="mb-3 font-display text-lg text-navy-900">ಸೇವಾವಾರು · By service</h2>
              <Table>
                <thead>
                  <tr><Th>ಸೇವೆ</Th><Th>ಸಂಖ್ಯೆ</Th><Th>ಶುಲ್ಕ</Th></tr>
                </thead>
                <tbody>
                  {data.byService.map((s) => (
                    <tr key={s.serviceId}>
                      <Td className="text-navy-900">{s.nameKn}</Td>
                      <Td>{s.count}</Td>
                      <Td>{formatPaise(s.feeTotalPaise)}</Td>
                    </tr>
                  ))}
                  {data.byService.length === 0 && <tr><Td>—</Td><Td> </Td><Td> </Td></tr>}
                </tbody>
              </Table>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl2 border border-line bg-white p-5 shadow-card">
      <p className="text-sm text-slate2">{label}</p>
      <p className="mt-1 font-display text-3xl text-navy-900">{value}</p>
    </div>
  );
}
