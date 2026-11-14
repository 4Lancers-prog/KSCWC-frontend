// MyApplicationsPage.tsx — the operator's own insurance / membership / training / grievance
// submissions with the status the admin has set (and any grievance resolution note).
import { Link } from 'react-router-dom';
import { Spinner, Alert, buttonClass } from '@/components/ui';
import { StatusBadge } from '@/components/layout/StatusBadge';
import { formatDate } from '@/lib/format';
import { useMyApplications, type MyApplicationRow } from '../applications.api';

const tone = (s: string) =>
  ['APPROVED', 'COMPLETED', 'RESOLVED', 'ATTENDED', 'CONFIRMED'].includes(s) ? 'success'
  : ['REJECTED', 'CANCELLED', 'CLOSED'].includes(s) ? 'neutral'
  : ['NEEDS_INFORMATION', 'WAITING_FOR_USER'].includes(s) ? 'warning' : 'info';

const LABEL: Record<string, string> = {
  SUBMITTED: 'ಸಲ್ಲಿಸಲಾಗಿದೆ · Submitted', UNDER_REVIEW: 'ಪರಿಶೀಲನೆಯಲ್ಲಿ · Under review',
  NEEDS_INFORMATION: 'ಮಾಹಿತಿ ಬೇಕು · Needs information', APPROVED: 'ಅನುಮೋದಿತ · Approved',
  REJECTED: 'ತಿರಸ್ಕೃತ · Rejected', COMPLETED: 'ಪೂರ್ಣ · Completed', REGISTERED: 'ನೋಂದಾಯಿತ · Registered',
  CONFIRMED: 'ದೃಢೀಕೃತ · Confirmed', ATTENDED: 'ಹಾಜರು · Attended', CANCELLED: 'ರದ್ದು · Cancelled',
  OPEN: 'ತೆರೆದಿದೆ · Open', IN_PROGRESS: 'ಪ್ರಗತಿಯಲ್ಲಿ · In progress',
  WAITING_FOR_USER: 'ನಿಮ್ಮ ಉತ್ತರ ಬೇಕು · Waiting for you', RESOLVED: 'ಪರಿಹರಿಸಲಾಗಿದೆ · Resolved', CLOSED: 'ಮುಚ್ಚಲಾಗಿದೆ · Closed',
};

const SECTIONS: { key: 'insurance' | 'membership' | 'training' | 'grievances'; kn: string; form: string; title: (r: MyApplicationRow) => string }[] = [
  { key: 'grievances', kn: 'ದೂರುಗಳು · Grievances', form: '/forms/grievance', title: (r) => `${r.ticketCode ?? ''} · ${r.category ?? ''}` },
  { key: 'insurance', kn: 'ವಿಮೆ · Insurance', form: '/forms/insurance', title: (r) => [r.customerName, r.policyType].filter(Boolean).join(' · ') },
  { key: 'membership', kn: 'ಸದಸ್ಯತ್ವ · Membership', form: '/forms/membership', title: (r) => r.centreName ?? r.operatorName ?? '' },
  { key: 'training', kn: 'ತರಬೇತಿ · Training', form: '/forms/training', title: (r) => `${r.topic ?? ''} · ${r.mode ?? ''}` },
];

export function MyApplicationsPage() {
  const { data, isLoading, isError } = useMyApplications();

  return (
    <div>
      <div className="gold-rule mb-4" />
      <h1 className="font-display text-2xl text-navy-900">ನನ್ನ ಅರ್ಜಿಗಳು</h1>
      <p className="mt-1 text-slate2">My applications · status updates from the council appear here</p>

      {isLoading && <div className="grid place-items-center py-16"><Spinner className="h-7 w-7 text-navy-500" /></div>}
      {isError && <div className="mt-6"><Alert tone="error">ಲೋಡ್ ಮಾಡಲಾಗಲಿಲ್ಲ · Could not load your applications.</Alert></div>}

      {data && (
        <div className="mt-6 space-y-6">
          {SECTIONS.map((s) => {
            const rows = data[s.key];
            return (
              <section key={s.key} className="rounded-xl2 border border-line bg-white p-5 shadow-card">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-display text-lg text-navy-900">{s.kn}</h2>
                  <Link to={s.form} className={buttonClass('secondary', 'sm')}>+ ಹೊಸ ಅರ್ಜಿ · Apply</Link>
                </div>
                {rows.length === 0 ? (
                  <p className="mt-3 text-sm text-slate2">ಇನ್ನೂ ಯಾವುದೂ ಇಲ್ಲ · Nothing submitted yet.</p>
                ) : (
                  <ul className="mt-3 divide-y divide-line">
                    {rows.map((r) => (
                      <li key={r.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <p className="font-medium text-navy-900">{s.title(r) || '—'}</p>
                          <p className="text-xs text-slate2">
                            ಸಲ್ಲಿಕೆ {formatDate(r.createdAt)}
                            {r.updatedAt !== r.createdAt && <> · ನವೀಕರಣ {formatDate(r.updatedAt)}</>}
                          </p>
                          {r.resolutionNote && (
                            <p className="mt-2 rounded-lg bg-mist px-3 py-2 text-sm text-navy-900">
                              <span className="font-semibold">ಪರಿಷತ್ ಉತ್ತರ · Council reply: </span>{r.resolutionNote}
                            </p>
                          )}
                        </div>
                        <StatusBadge label={LABEL[r.status] ?? r.status} tone={tone(r.status)} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
