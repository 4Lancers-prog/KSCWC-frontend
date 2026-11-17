// CategoriesAdmin.tsx — create / rename / delete categories and sub-categories
// for government portal links and for downloadable templates.
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Button, CategorySelect, FormField, Input, Modal, Spinner } from '@/components/ui';
import { ApiClientError } from '@/lib/api-client';
import { buildTree, catLabel } from '@/lib/categories';
import { useCategories } from '@/features/public-content/public-content.api';
import { useCategoryMutations } from '../admin.api';
import type { Category, CategoryScope } from '@/types/entities';

const TABS: { key: CategoryScope; kn: string; en: string }[] = [
  { key: 'LINKS', kn: 'ಸರ್ಕಾರಿ ಕೊಂಡಿಗಳು', en: 'Government portal links' },
  { key: 'DOCUMENTS', kn: 'ಅರ್ಜಿ ನಮೂನೆಗಳು', en: 'Application forms' },
  { key: 'DRAFTS', kn: 'ಕರಡುಗಳು', en: 'Drafts' },
];
const errText = (e: unknown) => (e instanceof ApiClientError ? [e.message, ...(e.fieldErrors ?? []).map((f) => f.message)].join(': ') : e instanceof Error ? e.message : 'Could not save');

export function CategoriesAdmin() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab');
  const scope: CategoryScope = tab === 'DOCUMENTS' || tab === 'DRAFTS' ? tab : 'LINKS';
  const { data, isLoading } = useCategories(scope);
  const m = useCategoryMutations(scope);
  const [form, setForm] = useState({ nameKn: '', nameEn: '', parentId: '' });
  const [err, setErr] = useState<string | null>(null);
  const [edit, setEdit] = useState<Category | null>(null);
  const [editErr, setEditErr] = useState<string | null>(null);
  const tree = buildTree(data);

  const add = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null);
    try {
      await m.create.mutateAsync({ nameKn: form.nameKn, nameEn: form.nameEn || undefined, parentId: form.parentId || null });
      setForm({ nameKn: '', nameEn: '', parentId: form.parentId }); // keep parent: add several subs quickly
    } catch (e2) { setErr(errText(e2)); }
  };
  const del = async (c: Category) => {
    if (!window.confirm(`“${catLabel(c)}” ಅಳಿಸಬೇಕೆ? · Delete this category?`)) return;
    try { await m.remove.mutateAsync(c.id); setErr(null); } catch (e2) { setErr(errText(e2)); }
  };

  return (
    <div>
      <div className="gold-rule mb-3" />
      <h1 className="font-display text-2xl text-navy-900">ವರ್ಗಗಳು · Categories</h1>
      <p className="text-sm text-slate2">Group portal links, application forms and drafts into categories and sub-categories.</p>

      <div className="mt-4 flex flex-wrap gap-2" role="tablist">
        {TABS.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={scope === t.key} className="chip"
            onClick={() => { setParams({ tab: t.key }); setErr(null); setForm({ nameKn: '', nameEn: '', parentId: '' }); }}>
            {t.kn} · {t.en}
          </button>
        ))}
      </div>

      <form onSubmit={add} className="mt-5 grid gap-3 rounded-xl2 border border-line bg-white p-5 sm:grid-cols-3">
        <FormField id="cn" label="ಹೆಸರು (ಕನ್ನಡ)" helper="Name in Kannada" required>
          <Input id="cn" value={form.nameKn} onChange={(e) => setForm({ ...form, nameKn: e.target.value })} required />
        </FormField>
        <FormField id="ce" label="ಹೆಸರು (English)" helper="Optional">
          <Input id="ce" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} />
        </FormField>
        <FormField id="cp" label="ಇದರ ಉಪ-ವರ್ಗ" helper="Sub-category of… (leave empty for a main category)">
          <CategorySelect id="cp" categories={data} topLevelOnly value={form.parentId}
            onChange={(v) => setForm({ ...form, parentId: v })} noneLabel="— ಮುಖ್ಯ ವರ್ಗ · Main category —" />
        </FormField>
        {err && <div className="sm:col-span-3"><Alert tone="error">{err}</Alert></div>}
        <div className="sm:col-span-3"><Button type="submit" loading={m.create.isPending}>+ ಸೇರಿಸಿ · Add</Button></div>
      </form>

      <div className="mt-6 space-y-3">
        {isLoading ? <div className="grid place-items-center py-12"><Spinner className="h-7 w-7 text-navy-500" /></div>
          : tree.length === 0 ? <div className="info-panel text-center text-slate2">ಇನ್ನೂ ವರ್ಗಗಳಿಲ್ಲ · No categories yet.</div>
          : tree.map(({ cat, children }) => (
            <section key={cat.id} className="rounded-xl2 border border-line bg-white">
              <Row c={cat} onEdit={() => { setEdit(cat); setEditErr(null); }} onDelete={() => del(cat)}
                onAddSub={() => {
                  setForm({ nameKn: '', nameEn: '', parentId: cat.id });
                  const f = document.getElementById('cn'); f?.scrollIntoView({ behavior: 'smooth', block: 'center' }); f?.focus();
                }} />
              {children.length > 0 && (
                <ul className="border-t border-line">
                  {children.map((c) => (
                    <li key={c.id} className="border-b border-line pl-8 last:border-b-0">
                      <Row c={c} sub onEdit={() => { setEdit(c); setEditErr(null); }} onDelete={() => del(c)} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
      </div>

      <Modal open={!!edit} onClose={() => setEdit(null)} title="ವರ್ಗ ಸಂಪಾದನೆ · Edit category">
        {edit && (
          <form key={edit.id} className="space-y-3" onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            try {
              await m.update.mutateAsync({ id: edit.id, body: {
                nameKn: String(fd.get('nameKn') || ''), nameEn: String(fd.get('nameEn') || '') || null,
                parentId: String(fd.get('parentId') || '') || null, sortOrder: Number(fd.get('sortOrder') || 0),
              } });
              setEdit(null);
            } catch (e2) { setEditErr(errText(e2)); }
          }}>
            {editErr && <Alert tone="error">{editErr}</Alert>}
            <FormField id="en-kn" label="ಹೆಸರು (ಕನ್ನಡ)" helper="Name in Kannada" required>
              <Input id="en-kn" name="nameKn" defaultValue={edit.nameKn} required />
            </FormField>
            <FormField id="en-en" label="ಹೆಸರು (English)" helper="Optional">
              <Input id="en-en" name="nameEn" defaultValue={edit.nameEn ?? ''} />
            </FormField>
            <FormField id="en-p" label="ಇದರ ಉಪ-ವರ್ಗ" helper="Move under another category">
              <CategorySelect id="en-p" name="parentId" topLevelOnly defaultValue={edit.parentId ?? ''}
                categories={data?.filter((c) => c.id !== edit.id)} noneLabel="— ಮುಖ್ಯ ವರ್ಗ · Main category —" />
            </FormField>
            <FormField id="en-s" label="ಕ್ರಮ" helper="Order (smaller shows first)">
              <Input id="en-s" name="sortOrder" type="number" min={0} defaultValue={String(edit.sortOrder ?? 0)} />
            </FormField>
            <div className="flex gap-2">
              <Button type="submit" loading={m.update.isPending}>ಉಳಿಸಿ · Save</Button>
              <Button type="button" variant="secondary" onClick={() => setEdit(null)}>ರದ್ದು · Cancel</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

function Row({ c, sub, onEdit, onDelete, onAddSub }: { c: Category; sub?: boolean; onEdit: () => void; onDelete: () => void; onAddSub?: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div>
        <p className={sub ? 'text-navy-900' : 'font-display text-lg text-navy-900'}>{sub && '↳ '}{c.nameKn}</p>
        {c.nameEn && <p className="text-sm text-slate2">{c.nameEn}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {onAddSub && <Button size="sm" variant="secondary" onClick={onAddSub}>+ ಉಪ-ವರ್ಗ · Sub-category</Button>}
        <Button size="sm" variant="secondary" onClick={onEdit}>ಸಂಪಾದಿಸಿ · Edit</Button>
        <Button size="sm" variant="ghost" onClick={onDelete}>ಅಳಿಸಿ · Delete</Button>
      </div>
    </div>
  );
}
