// UsersApprovals.tsx — review, approve, reject and suspend operator accounts.
// The list refreshes on its own (see LIVE in admin.api), so new sign-ups appear without reloading.
import { useState } from 'react';
import { Button, Input, Select, Table, Th, Td, Pagination, Spinner } from '@/components/ui';
import { StatusBadge } from '@/components/layout/StatusBadge';
import { formatDate } from '@/lib/format';
import { useAdminUsers, useUserAction, type AdminUser } from '../admin.api';
import { ReasonDialog } from '../components/ReasonDialog';
import { DevicesDialog } from '../components/DevicesDialog';

const statusTone = { PENDING_APPROVAL: 'warning', ACTIVE: 'success', REJECTED: 'danger', SUSPENDED: 'danger' } as const;
const statusLabel = {
  PENDING_APPROVAL: 'ಬಾಕಿ · Pending',
  ACTIVE: 'ಸಕ್ರಿಯ · Active',
  REJECTED: 'ತಿರಸ್ಕೃತ · Rejected',
  SUSPENDED: 'ಅಮಾನತು · Suspended',
} as const;

type Act = 'approve' | 'reject' | 'suspend' | 'reactivate';

export function UsersApprovals() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('PENDING_APPROVAL');
  const [search, setSearch] = useState('');
  const { data, isLoading, isFetching } = useAdminUsers({ status: status || undefined, search: search || undefined, page });
  const action = useUserAction();
  const [dialog, setDialog] = useState<{ user: AdminUser; act: 'reject' | 'suspend' } | null>(null);
  const [devicesFor, setDevicesFor] = useState<AdminUser | null>(null);

  const run = (u: AdminUser, act: Act) => {
    if (act === 'reject' || act === 'suspend') return setDialog({ user: u, act });
    action.mutate({ id: u.id, action: act });
  };

  return (
    <div>
      <div className="gold-rule mb-3" />
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl text-navy-900">ಬಳಕೆದಾರ ಅನುಮೋದನೆಗಳು</h1>
          <p className="text-sm text-slate2">User approvals · new sign-ups appear here automatically</p>
        </div>
        {isFetching && !isLoading && <Spinner className="h-4 w-4 text-navy-400" />}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
        <Input placeholder="ಹೆಸರು / ಮೊಬೈಲ್ / ಕೇಂದ್ರ ಹುಡುಕಿ · Search name, mobile, centre" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">ಎಲ್ಲಾ · All</option>
          <option value="PENDING_APPROVAL">ಬಾಕಿ · Pending</option>
          <option value="ACTIVE">ಸಕ್ರಿಯ · Active</option>
          <option value="SUSPENDED">ಅಮಾನತು · Suspended</option>
          <option value="REJECTED">ತಿರಸ್ಕೃತ · Rejected</option>
        </Select>
      </div>

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
              <thead><tr><Th>ಹೆಸರು · Name</Th><Th>ಸಂಪರ್ಕ · Contact</Th><Th>ಕೇಂದ್ರ · Centre</Th><Th>ನೋಂದಣಿ · Registered</Th><Th>ಸ್ಥಿತಿ</Th><Th>ಕ್ರಿಯೆಗಳು</Th></tr></thead>
              <tbody>
                {data.items.map((u) => (
                  <tr key={u.id}>
                    <Td className="text-navy-900">
                      {u.fullName}
                      {u.role !== 'USER' && <div className="text-xs font-semibold text-navy-600">{u.role}</div>}
                    </Td>
                    <Td>
                      {u.phoneNormalized}
                      {u.emailNormalized && <div className="text-xs">{u.emailNormalized}</div>}
                    </Td>
                    <Td>
                      {u.centreName ?? '—'}
                      {u.cscId && <div className="text-xs">CSC ID: {u.cscId}</div>}
                    </Td>
                    <Td className="whitespace-nowrap">{formatDate(u.createdAt)}</Td>
                    <Td>
                      <StatusBadge label={statusLabel[u.accountStatus]} tone={statusTone[u.accountStatus]} />
                      {u.rejectedReason && u.accountStatus !== 'ACTIVE' && (
                        <div className="mt-1 max-w-[16rem] text-xs">{u.rejectedReason}</div>
                      )}
                    </Td>
                    <Td>
                      <div className="flex flex-wrap gap-2">
                        {u.accountStatus === 'PENDING_APPROVAL' && (
                          <>
                            <Button size="sm" loading={action.isPending && action.variables?.id === u.id && action.variables.action === 'approve'}
                              onClick={() => run(u, 'approve')}>ಅನುಮೋದಿಸಿ · Approve</Button>
                            <Button size="sm" variant="danger" onClick={() => run(u, 'reject')}>ತಿರಸ್ಕರಿಸಿ · Reject</Button>
                          </>
                        )}
                        {u.accountStatus === 'ACTIVE' && u.role === 'USER' && (
                          <Button size="sm" variant="secondary" onClick={() => run(u, 'suspend')}>ಅಮಾನತು · Suspend</Button>
                        )}
                        {u.accountStatus === 'SUSPENDED' && <Button size="sm" onClick={() => run(u, 'reactivate')}>ಮರುಸಕ್ರಿಯ · Reactivate</Button>}
                        {u.role === 'USER' && u.accountStatus !== 'PENDING_APPROVAL' && u.accountStatus !== 'REJECTED' && (
                          <Button size="sm" variant="secondary" onClick={() => setDevicesFor(u)}>ಸಾಧನಗಳು · Devices</Button>
                        )}
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

      <DevicesDialog user={devicesFor} onClose={() => setDevicesFor(null)} />

      <ReasonDialog
        open={!!dialog}
        danger
        busy={action.isPending}
        title={dialog?.act === 'reject' ? 'ನೋಂದಣಿ ತಿರಸ್ಕರಿಸಿ · Reject registration' : 'ಖಾತೆ ಅಮಾನತು · Suspend account'}
        description={dialog ? `${dialog.user.fullName} · ${dialog.user.phoneNormalized}` : undefined}
        confirmLabel={dialog?.act === 'reject' ? 'ತಿರಸ್ಕರಿಸಿ · Reject' : 'ಅಮಾನತು · Suspend'}
        onCancel={() => setDialog(null)}
        onConfirm={(reason) => {
          if (!dialog) return;
          action.mutate({ id: dialog.user.id, action: dialog.act, reason }, { onSuccess: () => setDialog(null) });
        }}
      />
    </div>
  );
}
