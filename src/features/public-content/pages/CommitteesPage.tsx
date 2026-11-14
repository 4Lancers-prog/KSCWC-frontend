// CommitteesPage.tsx — founders/trustees/state/district committees with a district filter.
import { useState } from 'react';
import { PageIntro } from '@/components/layout/PageIntro';
import { Spinner, Alert } from '@/components/ui';
import { L, H } from '@/i18n';
import { usePublicCommittees } from '../public-content.api';
import type { CommitteeMember } from '@/types/entities';

const GROUPS: { type: CommitteeMember['committeeType']; kn: string }[] = [
  { type: 'FOUNDER', kn: 'ಸಂಸ್ಥಾಪಕರು' },
  { type: 'TRUSTEE', kn: 'ಟ್ರಸ್ಟಿಗಳು' },
  { type: 'STATE', kn: 'ರಾಜ್ಯ ಸಮಿತಿ' },
  { type: 'DISTRICT', kn: 'ಜಿಲ್ಲಾ ಸಮಿತಿ' },
];

export function CommitteesPage() {
  const [district, setDistrict] = useState('');
  const { data, isLoading, isError } = usePublicCommittees(district ? { district } : undefined);

  const districts = Array.from(new Set((data ?? []).map((m) => m.district).filter(Boolean))) as string[];

  return (
    <PageIntro title={L.committees_title} subtitle={H.committees_title}>
      {isLoading ? (
        <div className="grid place-items-center py-16"><Spinner className="h-7 w-7 text-navy-500" /></div>
      ) : isError ? (
        <Alert tone="error">ಲೋಡ್ ಆಗಲಿಲ್ಲ · Could not load committees.</Alert>
      ) : !data || data.length === 0 ? (
        <div className="rounded-xl2 border border-dashed border-line bg-mist p-10 text-center text-slate2">—</div>
      ) : (
        <>
          {districts.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate2">ಜಿಲ್ಲೆ:</span>
              <button onClick={() => setDistrict('')} className="chip" aria-pressed={!district}>ಎಲ್ಲಾ</button>
              {districts.map((d) => (
                <button key={d} onClick={() => setDistrict(d)} className="chip" aria-pressed={district === d}>{d}</button>
              ))}
            </div>
          )}
          {GROUPS.map((g) => {
            const members = data.filter((m) => m.committeeType === g.type);
            if (members.length === 0) return null;
            return (
              <section key={g.type} className="mb-10">
                <h2 className="mb-4 font-display text-xl text-navy-900">{g.kn}</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {members.map((m) => (
                    <div key={m.id} className="rounded-xl2 border border-line bg-white p-5 shadow-card">
                      <p className="font-display text-lg text-navy-900">{m.name}</p>
                      {m.roleTitle && <p className="text-sm text-navy-600">{m.roleTitle}</p>}
                      {m.district && <p className="text-sm text-slate2">{m.district}</p>}
                      {m.bio && <p className="mt-2 text-sm leading-relaxed text-slate2">{m.bio}</p>}
                      {m.publicPhone && <p className="mt-2 text-sm text-slate2">☎ {m.publicPhone}</p>}
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </>
      )}
    </PageIntro>
  );
}
