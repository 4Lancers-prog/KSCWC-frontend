// UsersApprovals.tsx — review, approve, reject and suspend operator accounts.
import { useState } from 'react';
import { Button, Input, Select, Table, Th, Td, Pagination, Spinner, Alert } from '@/components/ui';
import { StatusBadge } from '@/components/layout/StatusBadge';
import { useAdminUsers, useUserAction } from '../admin.api';

const statusTone = { PENDING_APPROVAL: 'warning', ACTIVE: 'success', REJECTED: 'danger', SUSPENDED: 'danger' } as const;

export function UsersApprovals() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('PENDING_APPROVAL');
  const [search, setSearch] = useState('');
  const { data, isLoading } = useAdminUsers({ status: status || undefined, search: search || undefined, page });
  const action = useUserAction();

  const run = (id: string, act: 'approve' | 'reject' | 'suspend' | 'reactivate') => {
    let reason: string | undefined;
    if (act === 'reject' || act === 'suspend') {
      reason = window.prompt('ಕಾರಣ ನಮೂದಿಸಿ · Enter a reason') ?? undefined;
      if (!reason) return;
    }
    action.mutate({ id, action: act, reason });
  };

  return (
    <div>
      <div className="gold-rule mb-3" />
      <h1 className="font-display text-2xl text-navy-900">ಬಳಕೆದಾರ ಅನುಮೋದನೆಗಳು</h1>
      <p className="text-sm text-slate2">User approvals</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
        <Input placeholder="ಹೆಸರು / ಮೊಬೈಲ್ ಹುಡುಕಿ" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">ಎಲ್ಲಾ</option>
          <option value="PENDING_APPROVAL">ಬಾಕಿ · Pending</option>
          <option value="ACTIVE">ಸಕ್ರಿಯ · Active</option>
          <option value="SUSPENDED">ಅಮಾನತು · Suspended</option>
          <option value="REJECTED">ತಿರಸ್ಕೃತ · Rejected</option>
        </Select>
      </div>

      {action.isError && <div className="mt-3"><Alert tone="error">ಕ್ರಿಯೆ ವಿಫಲ · Action failed.</Alert></div>}

      <div className="mt-6">
        {isLoading ? <div className="grid place-items-center py-16"><Spinner className="h-7 w-7 text-navy-500" /></div> : !data || data.total === 0 ? (
          <div className="rounded-xl2 border border-dashed border-line bg-white p-12 text-center">
            <p className="font-display text-navy-900">
              {status === 'PENDING_APPROVAL' ? 'ಯಾವುದೇ ಬಾಕಿ ನೋಂದಣಿಗಳಿಲ್ಲ' : 'ಯಾವುದೇ ಬಳಕೆದಾರರಿಲ್ಲ'}
            </p>
            <p className="mt-1 text-sm text-slate2">
              {status === 'PENDING_APPROVAL'
                ? 'No pending registrations right now. New sign-ups appear here for approval.'
                : 'No users match this filter.'}
            </p>
          </div>
        ) : (
          <div className="animate-fade-in">
            <Table>
              <thead><tr><Th>ಹೆಸರು</Th><Th>ಮೊಬೈಲ್</Th><Th>ಸ್ಥಿತಿ</Th><Th>ಕ್ರಿಯೆಗಳು</Th></tr></thead>
              <tbody>
                {data.items.map((u) => (
                  <tr key={u.id}>
                    <Td className="text-navy-900">{u.fullName}<div className="text-xs text-slate2">{u.centreName}</div></Td>
                    <Td>{u.phoneNormalized}</Td>
                    <Td><StatusBadge label={u.accountStatus} tone={statusTone[u.accountStatus]} /></Td>
                    <Td>
                      <div className="flex flex-wrap gap-2">
                        {u.accountStatus === 'PENDING_APPROVAL' && (
                          <>
                            <Button size="sm" onClick={() => run(u.id, 'approve')}>ಅನುಮೋದಿಸಿ</Button>
                            <Button size="sm" variant="danger" onClick={() => run(u.id, 'reject')}>ತಿರಸ್ಕರಿಸಿ</Button>
                          </>
                        )}
                        {u.accountStatus === 'ACTIVE' && <Button size="sm" variant="secondary" onClick={() => run(u.id, 'suspend')}>ಅಮಾನತು</Button>}
                        {u.accountStatus === 'SUSPENDED' && <Button size="sm" onClick={() => run(u.id, 'reactivate')}>ಮರುಸಕ್ರಿಯ</Button>}
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
