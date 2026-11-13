// ApplicationsAdmin.tsx — insurance / membership / training / grievance queues + status updates.
// Status changes (and grievance resolution notes) flow back to the operator's "My applications".
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Select, Table, Th, Td, Pagination, Spinner } from '@/components/ui';
import { StatusBadge } from '@/components/layout/StatusBadge';
import { formatDate } from '@/lib/format';
import { useAdminApplications, useApplicationStatus, useAdminOverview } from '../admin.api';
import { ReasonDialog } from '../components/ReasonDialog';

type Kind = 'insurance' | 'membership' | 'training' | 'grievances';

const KINDS: { key: Kind; kn: string; statuses: string[] }[] = [
  { key: 'insurance', kn: 'ವಿಮೆ · Insurance', statuses: ['SUBMITTED', 'UNDER_REVIEW', 'NEEDS_INFORMATION', 'APPROVED', 'REJECTED', 'COMPLETED'] },
  { key: 'membership', kn: 'ಸದಸ್ಯತ್ವ · Membership', statuses: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'] },
  { key: 'training', kn: 'ತರಬೇತಿ · Training', statuses: ['REGISTERED', 'CONFIRMED', 'ATTENDED', 'CANCELLED'] },
  { key: 'grievances', kn: 'ದೂರುಗಳು · Grievances', statuses: ['OPEN', 'IN_PROGRESS', 'WAITING_FOR_USER', 'RESOLVED', 'CLOSED'] },
];

// Which fields to show for each kind (label → key).
const DETAILS: Record<Kind, [string, string][]> = {
  insurance: [['Customer', 'customerName'], ['Mobile', 'mobileNormalized'], ['Policy', 'policyType'], ['Vehicle', 'vehicleNumber'], ['Nominee', 'nomineeName'], ['Relation', 'nomineeRelation'], ['Notes', 'notes']],
  membership: [['Operator', 'operatorName'], ['Centre', 'centreName'], ['District', 'district'], ['Taluk', 'taluk'], ['Mobile', 'phoneNormalized'], ['Email', 'emailNormalized']],
  training: [['Name', 'name'], ['Mobile', 'phoneNormalized'], ['Topic', 'topic'], ['Mode', 'mode'], ['Notes', 'notes']],
  grievances: [['Ticket', 'ticketCode'], ['Name', 'name'], ['Mobile', 'phoneNormalized'], ['Category', 'category'], ['Details', 'details'], ['Resolution note', 'resolutionNote']],
};
const TITLE: Record<Kind, string> = { insurance: 'customerName', membership: 'operatorName', training: 'name', grievances: 'name' };
const SUB: Record<Kind, string> = { insurance: 'policyType', membership: 'centreName', training: 'topic', grievances: 'category' };

const tone = (s: string) =>
  ['APPROVED', 'COMPLETED', 'RESOLVED', 'ATTENDED', 'CONFIRMED'].includes(s) ? 'success'
  : ['REJECTED', 'CANCELLED', 'CLOSED'].includes(s) ? 'neutral'
  : ['NEEDS_INFORMATION', 'WAITING_FOR_USER'].includes(s) ? 'warning' : 'info';

// Grievance statuses where the operator should be told something.
const NOTE_STATUSES = ['WAITING_FOR_USER', 'RESOLVED', 'CLOSED'];

export function ApplicationsAdmin() {
  const [params, setParams] = useSearchParams();
  const kindIdx = Math.max(0, KINDS.findIndex((k) => k.key === params.get('tab')));
  const kind = KINDS[kindIdx]!;
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [noteFor, setNoteFor] = useState<{ id: string; status: string } | null>(null);
  const { data, isLoading } = useAdminApplications(kind.key, page, status || undefined);
  const setStatusM = useApplicationStatus(kind.key);
  const overview = useAdminOverview().data;

  const badge: Record<Kind, number> = {
    insurance: overview?.newInsurance ?? 0,
    membership: overview?.newMembership ?? 0,
    training: overview?.newTraining ?? 0,
    grievances: overview?.openGrievances ?? 0,
  };

  const change = (id: string, next: string) => {
    if (kind.key === 'grievances' && NOTE_STATUSES.includes(next)) return setNoteFor({ id, status: next });
    setStatusM.mutate({ id, status: next });
  };

  return (
    <div>
      <div className="gold-rule mb-3" />
      <h1 className="font-display text-2xl text-navy-900">ಅರ್ಜಿಗಳು · Applications</h1>
      <p className="text-sm text-slate2">Status changes are visible to the operator under “My applications”.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {KINDS.map((k, i) => (
          <button key={k.key} onClick={() => { setParams({ tab: k.key }); setPage(1); setStatus(''); setOpen(null); }}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm ${i === kindIdx ? 'bg-navy-600 text-white' : 'bg-white ring-1 ring-line'}`}>
            {k.kn}
            {badge[k.key] > 0 && <span className="rounded-full bg-gold-500 px-1.5 text-xs font-bold text-navy-950">{badge[k.key]}</span>}
          </button>
        ))}
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="ml-auto w-48">
          <option value="">ಎಲ್ಲಾ ಸ್ಥಿತಿ · All statuses</option>
          {kind.statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>

      <div className="mt-6">
        {isLoading ? <div className="grid place-items-center py-16"><Spinner className="h-7 w-7 text-navy-500" /></div> : !data || data.total === 0 ? (
          <div className="rounded-xl2 border border-dashed border-line bg-white p-10 text-center text-slate2">
            ಯಾವುದೇ ಅರ್ಜಿಗಳಿಲ್ಲ · Nothing here yet.
          </div>
        ) : (
          <>
            <Table>
              <thead><tr><Th>ಅರ್ಜಿದಾರ · Applicant</Th><Th>ದಿನಾಂಕ · Date</Th><Th>ಸ್ಥಿತಿ · Status</Th><Th>ಬದಲಿಸಿ · Change</Th></tr></thead>
              <tbody>
                {data.items.map((row) => {
                  const r = row as Record<string, string | null>;
                  const id = r.id ?? '';
                  const isOpen = open === id;
                  return [
                    <tr key={id}>
                      <Td className="text-navy-900">
                        <button className="text-left hover:underline" onClick={() => setOpen(isOpen ? null : id)} aria-expanded={isOpen}>
                          {r[TITLE[kind.key]] ?? '—'} <span className="text-xs text-slate2">{isOpen ? '▲' : '▼'}</span>
                        </button>
                        <div className="text-xs text-slate2">
                          {[r.ticketCode, r[SUB[kind.key]], r.phoneNormalized ?? r.mobileNormalized].filter(Boolean).join(' · ')}
                        </div>
                        {r.submittedByUserId && <div className="text-xs text-navy-600">ನೋಂದಾಯಿತ ಸಂಚಾಲಕ · Submitted by a signed-in operator</div>}
                      </Td>
                      <Td className="whitespace-nowrap">{r.createdAt ? formatDate(r.createdAt) : '—'}</Td>
                      <Td><StatusBadge label={r.status ?? '—'} tone={tone(r.status ?? '')} /></Td>
                      <Td>
                        <Select value={r.status ?? ''} disabled={setStatusM.isPending} onChange={(e) => change(id, e.target.value)} className="w-48">
                          {kind.statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                        </Select>
                      </Td>
                    </tr>,
                    isOpen && (
                      <tr key={`${id}-d`}>
                        <Td colSpan={4} className="bg-mist">
                          <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                            {DETAILS[kind.key].map(([label, key]) => (
                              <div key={key}>
                                <dt className="text-xs uppercase tracking-wide text-slate2">{label}</dt>
                                <dd className="whitespace-pre-wrap text-navy-900">{r[key] || '—'}</dd>
                              </div>
                            ))}
                          </dl>
                        </Td>
                      </tr>
                    ),
                  ];
                })}
              </tbody>
            </Table>
            <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onChange={setPage} />
          </>
        )}
      </div>

      <ReasonDialog
        open={!!noteFor}
        required={noteFor?.status !== 'CLOSED'}
        busy={setStatusM.isPending}
        title={`ದೂರು ಸ್ಥಿತಿ → ${noteFor?.status ?? ''}`}
        description="ಈ ಟಿಪ್ಪಣಿ ಸಂಚಾಲಕರಿಗೆ ಕಾಣಿಸುತ್ತದೆ · This note is shown to the operator."
        confirmLabel="ಉಳಿಸಿ · Save"
        onCancel={() => setNoteFor(null)}
        onConfirm={(note) => {
          if (!noteFor) return;
          setStatusM.mutate(
            { id: noteFor.id, status: noteFor.status, resolutionNote: note || undefined },
            { onSuccess: () => setNoteFor(null) },
          );
        }}
      />
    </div>
  );
}
