// TemplateList.tsx — downloadable templates grouped by category → sub-category, with a clear
// file-type badge (PDF / Word) and a Download button. Used on the public Downloads page and
// inside the operator dashboard.
import { useState } from 'react';
import { buttonClass, Icons } from '@/components/ui';
import { downloadFile } from '@/lib/download';
import { groupByCategory } from '@/lib/categories';
import { toast } from '@/lib/toast';
import type { Category, PublicDocument } from '@/types/entities';
import { useSearchParams } from 'react-router-dom';
import { useCategories } from '../public-content.api';

const TYPE: Record<string, { label: string; cls: string }> = {
  pdf: { label: 'PDF', cls: 'bg-red-50 text-red-700 ring-red-200' },
  doc: { label: 'Word', cls: 'bg-blue-50 text-blue-700 ring-blue-200' },
  docx: { label: 'Word', cls: 'bg-blue-50 text-blue-700 ring-blue-200' },
  png: { label: 'Image', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  jpg: { label: 'Image', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
};
const size = (b: number) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

function TemplateRow({ d }: { d: PublicDocument }) {
  const [busy, setBusy] = useState(false);
  const t = TYPE[d.fileExt ?? ''] ?? { label: (d.fileExt ?? 'File').toUpperCase(), cls: 'bg-mist text-slate2 ring-line' };
  const editable = d.fileExt === 'doc' || d.fileExt === 'docx';
  const badge = <span className={`inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[11px] font-bold ring-1 ${t.cls}`}>{t.label}</span>;
  return (
    // phones: [picture | title + details] then a full-width Download button; wider screens: one row
    <li className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-3 p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
      {d.imageUrl ? (
        <a href={d.imageUrl} target="_blank" rel="noopener noreferrer" title="ದೊಡ್ಡದಾಗಿ ನೋಡಿ · View larger" className="shrink-0">
          <img src={d.imageUrl} alt={`${d.title} — preview`} loading="lazy" decoding="async"
            className="h-20 w-16 rounded-md border border-line bg-white object-cover shadow-sm" />
        </a>
      ) : (
        <span className={`grid h-20 w-16 place-items-center rounded-md text-xs font-bold ring-1 ${t.cls}`}>{t.label}</span>
      )}
      <div className="min-w-0">
        <p className="font-medium leading-snug text-navy-900">{d.title}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate2">
          {d.imageUrl && badge}
          <span>{size(d.sizeBytes)}</span>
          {editable && <span>· ತುಂಬಿಸಬಹುದಾದ · editable in Word</span>}
          {d.visibility === 'PRIVATE' && <span>· 🔒 ಸದಸ್ಯರಿಗೆ ಮಾತ್ರ · members only</span>}
        </p>
        {d.description && <p className="mt-1 text-xs text-slate2">{d.description}</p>}
      </div>
      <button type="button" className={buttonClass('secondary', 'sm', 'col-span-2 w-full sm:col-span-1 sm:w-auto')} disabled={busy}
        onClick={async () => {
          setBusy(true);
          try { await downloadFile(`/public/documents/${d.id}/download`, `${d.title}.${d.fileExt ?? 'pdf'}`); }
          catch { toast('ಡೌನ್‌ಲೋಡ್ ವಿಫಲ · Download failed — please log in again or retry', 'error'); }
          finally { setBusy(false); }
        }}>
        <Icons.file /> ಡೌನ್‌ಲೋಡ್ · Download
      </button>
    </li>
  );
}

export function TemplateList({ docs, categories }: { docs: PublicDocument[]; categories: Category[] | undefined }) {
  const { groups, orphans } = groupByCategory(docs, categories, (d) => d.categoryId);
  const List = ({ items }: { items: PublicDocument[] }) => (
    <ul className="divide-y divide-line rounded-xl2 border border-line bg-white">{items.map((d) => <TemplateRow key={d.id} d={d} />)}</ul>
  );
  return (
    <div className="space-y-8">
      {groups.map((g) => (
        <section key={g.cat.id}>
          <h2 className="font-display text-lg text-navy-900">{g.cat.nameKn}{g.cat.nameEn && <span className="text-slate2"> · {g.cat.nameEn}</span>}</h2>
          {g.direct.length > 0 && <div className="mt-3"><List items={g.direct} /></div>}
          {g.subs.map((s) => (
            <div key={s.cat.id} className="mt-4 border-l-4 border-gold-400 pl-4">
              <h3 className="font-medium text-navy-800">{s.cat.nameKn}{s.cat.nameEn && <span className="text-slate2"> · {s.cat.nameEn}</span>}</h3>
              <div className="mt-2"><List items={s.items} /></div>
            </div>
          ))}
        </section>
      ))}
      {orphans.length > 0 && (
        <section>
          <h2 className="font-display text-lg text-navy-900">ಇತರೆ <span className="text-slate2">· Other</span></h2>
          <div className="mt-3"><List items={orphans} /></div>
        </section>
      )}
    </div>
  );
}

// ── Two sections: application forms | drafts, each with its own categories ──

const SECTIONS = [
  { kind: 'APPLICATION' as const, scope: 'DOCUMENTS' as const, kn: 'ಅರ್ಜಿ ನಮೂನೆಗಳು', en: 'Application forms' },
  { kind: 'DRAFT' as const, scope: 'DRAFTS' as const, kn: 'ಕರಡುಗಳು', en: 'Drafts' },
];

export function DocumentSections({ docs }: { docs: PublicDocument[] }) {
  const [params, setParams] = useSearchParams();
  const active = params.get('tab') === 'DRAFT' ? SECTIONS[1]! : SECTIONS[0]!;
  const cats = useCategories(active.scope);
  const inSection = (k: string) => docs.filter((d) => (d.kind ?? 'APPLICATION') === k);
  const items = inSection(active.kind);
  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap" role="tablist">
        {SECTIONS.map((t) => (
          <button key={t.kind} type="button" role="tab" aria-selected={active.kind === t.kind} className="chip justify-center"
            onClick={() => setParams({ tab: t.kind }, { replace: true })}>
            {t.kn}<span className="hidden sm:inline"> · {t.en}</span>
            <span className="rounded-full bg-white/80 px-1.5 text-xs text-navy-800">{inSection(t.kind).length}</span>
          </button>
        ))}
      </div>
      {items.length === 0
        ? <div className="info-panel text-center text-slate2">ಇಲ್ಲಿ ಇನ್ನೂ ಏನೂ ಇಲ್ಲ · Nothing here yet.</div>
        : <TemplateList docs={items} categories={cats.data} />}
    </div>
  );
}
