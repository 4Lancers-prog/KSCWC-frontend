// CustomerListPage.tsx — operator customer list with filters, pagination and CSV export.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Select, Table, Th, Td, Pagination, Spinner, Alert } from '@/components/ui';
import { StatusBadge } from '@/components/layout/StatusBadge';
import { useCustomers, useServices, type CustomerFilter } from '../customers.api';
import { customerStatusMeta } from '@/lib/status';
import { downloadFile } from '@/lib/download';
import { formatDateOnly } from '@/lib/format';
import type { CustomerStatus } from '@/types/entities';

export function CustomerListPage() {
  const [filter, setFilter] = useState<CustomerFilter>({ page: 1, limit: 20 });
  const [search, setSearch] = useState('');
  const { data: services } = useServices();
  const { data, isLoading, isError } = useCustomers(filter);

  const set = (patch: Partial<CustomerFilter>) => setFilter((f) => ({ ...f, ...patch, page: 1 }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="gold-rule mb-3" />
          <h1 className="font-display text-2xl text-navy-900">ಗ್ರಾಹಕರು</h1>
          <p className="text-sm text-slate2">Customer records</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => downloadFile('/reports/export.csv', `customers-${Date.now()}.csv`)}
          >
            CSV ಡೌನ್‌ಲೋಡ್
          </Button>
          <Link to="/app/customers/new" className="inline-flex h-11 items-center rounded-lg bg-navy-600 px-5 text-[15px] font-medium text-white hover:bg-navy-700">
            + ಹೊಸ ಗ್ರಾಹಕ
          </Link>
        </div>
      </div>

      {/* filters */}
      <form
        className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          set({ search });
        }}
      >
        <Input placeholder="ಹೆಸರು / ಮೊಬೈಲ್ ಹುಡುಕಿ · Search name or mobile" value={search}
          onChange={(e) => setSearch(e.target.value)} />
        <Select value={filter.status ?? ''} onChange={(e) => set({ status: e.target.value as CustomerStatus | '' })}>
          <option value="">ಎಲ್ಲಾ ಸ್ಥಿತಿ · All statuses</option>
          {Object.entries(customerStatusMeta).map(([k, v]) => (
            <option key={k} value={k}>{v.kn} · {v.en}</option>
          ))}
        </Select>
        <Select value={filter.serviceId ?? ''} onChange={(e) => set({ serviceId: e.target.value })}>
          <option value="">ಎಲ್ಲಾ ಸೇವೆಗಳು · All services</option>
          {services?.map((s) => <option key={s.id} value={s.id}>{s.nameKn}</option>)}
        </Select>
      </form>

      <div className="mt-6">
        {isLoading ? (
          <div className="grid place-items-center py-16"><Spinner className="h-7 w-7 text-navy-500" /></div>
        ) : isError ? (
          <Alert tone="error">ಪಟ್ಟಿ ಲೋಡ್ ಆಗಲಿಲ್ಲ · Could not load customers.</Alert>
        ) : !data || data.total === 0 ? (
          <div className="rounded-xl2 border border-dashed border-line bg-white p-12 text-center">
            <p className="font-display text-navy-900">ಇನ್ನೂ ಯಾವುದೇ ಗ್ರಾಹಕರಿಲ್ಲ</p>
            <p className="mt-1 text-sm text-slate2">No customers yet. Add your first record.</p>
            <Link to="/app/customers/new" className="mt-4 inline-block rounded-lg bg-navy-600 px-5 py-2.5 text-white hover:bg-navy-700">
              + ಹೊಸ ಗ್ರಾಹಕ
            </Link>
          </div>
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <Th>ಹೆಸರು · Name</Th>
                  <Th>ಮೊಬೈಲ್</Th>
                  <Th>ಸೇವೆ · Service</Th>
                  <Th>ಸ್ಥಿತಿ · Status</Th>
                  <Th>ದಿನಾಂಕ</Th>
                  <Th> </Th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((c) => {
                  const meta = customerStatusMeta[c.status];
                  return (
                    <tr key={c.id} className="hover:bg-mist">
                      <Td className="font-medium text-navy-900">{c.fullName}</Td>
                      <Td>{c.mobileNormalized}</Td>
                      <Td>{c.service?.nameKn ?? '—'}</Td>
                      <Td><StatusBadge label={`${meta.kn}`} tone={meta.tone} /></Td>
                      <Td>{formatDateOnly(c.createdAt)}</Td>
                      <Td>
                        <Link to={`/app/customers/${c.id}`} className="font-medium text-navy-600 hover:underline">
                          ವಿವರ
                        </Link>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              total={data.total}
              onChange={(page) => setFilter((f) => ({ ...f, page }))}
            />
          </>
        )}
      </div>
    </div>
  );
}
