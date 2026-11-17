// DocumentsAdmin.tsx — templates & documents: upload PDF / Word (.doc, .docx) / images, put them in
// a category or sub-category, choose who can download them, edit, archive.
import { useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { shrinkImage } from '@/lib/image-shrink';
import { Alert, Button, buttonClass, CategorySelect, FormField, Input, Modal, Select, Spinner, Table, Td, Th } from '@/components/ui';
import { categoryPath } from '@/lib/categories';
import { ApiClientError } from '@/lib/api-client';
import { useCategories } from '@/features/public-content/public-content.api';
import { useAdminDocuments, useDocumentMutations, type AdminDocument } from '../admin.api';

const ACCEPT = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg';
const errText = (e: unknown) => (e instanceof ApiClientError ? [e.message, ...(e.fieldErrors ?? []).map((f) => f.message)].join(': ') : e instanceof Error ? e.message : 'Could not save');
const TYPE: Record<string, string> = { pdf: 'PDF', doc: 'Word', docx: 'Word', png: 'Image', jpg: 'Image' };
const VIS = { PUBLIC: 'ಎಲ್ಲರಿಗೂ · Everyone', PRIVATE: '🔒 ಸಂಚಾಲಕರಿಗೆ ಮಾತ್ರ · Logged-in operators only' };

const SECTIONS = [
  { kind: 'APPLICATION' as const, scope: 'DOCUMENTS' as const, kn: 'ಅರ್ಜಿ ನಮೂನೆಗಳು', en: 'Application forms' },
  { kind: 'DRAFT' as const, scope: 'DRAFTS' as const, kn: 'ಕರಡುಗಳು', en: 'Drafts' },
];

export function DocumentsAdmin() {
  const [params, setParams] = useSearchParams();
  const section = params.get('tab') === 'DRAFT' ? SECTIONS[1]! : SECTIONS[0]!;
  const { data: all, isLoading } = useAdminDocuments();
  const data = all?.filter((d) => (d.kind ?? 'APPLICATION') === section.kind);
  const cats = useCategories(section.scope);
  const { upload, archive, update, setImage, removeImage } = useDocumentMutations();
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);
  const EMPTY = { title: '', description: '', categoryId: '', visibility: 'PRIVATE' as 'PUBLIC' | 'PRIVATE' };
  const [meta, setMeta] = useState(EMPTY);
  const [err, setErr] = useState<string | null>(null);
  const [edit, setEdit] = useState<AdminDocument | null>(null);
  const [editErr, setEditErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const file = fileRef.current?.files?.[0];
    if (!file) return setErr('ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ · Choose a PDF or Word file');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', meta.title || file.name.replace(/\.[^.]+$/, ''));
    fd.append('kind', section.kind);
    if (meta.description) fd.append('description', meta.description);
    if (meta.categoryId) fd.append('categoryId', meta.categoryId);
    fd.append('visibility', meta.visibility);
    const image = imgRef.current?.files?.[0];
    let created: AdminDocument;
    try {
      created = ((await upload.mutateAsync(fd)) as { document: AdminDocument }).document;
    } catch (e2) { setErr(errText(e2)); return; }
    // the document is saved — reset the form now, so a retry can't upload it twice
    setMeta({ ...EMPTY, categoryId: meta.categoryId, visibility: meta.visibility });
    if (fileRef.current) fileRef.current.value = '';
    if (imgRef.current) imgRef.current.value = '';
    if (image) {
      try { await setImage.mutateAsync({ id: created.id, file: await shrinkImage(image, 800) }); }
      catch (e3) { setErr(`ದಾಖಲೆ ಉಳಿಸಲಾಗಿದೆ, ಆದರೆ ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಆಗಲಿಲ್ಲ · Document saved, but the image did not upload (${errText(e3)}). Use “Edit” to add it.`); }
    }
  };

  return (
    <div>
      <div className="gold-rule mb-3" />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-navy-900">ಅರ್ಜಿ ನಮೂನೆಗಳು ಮತ್ತು ಕರಡುಗಳು</h1>
          <p className="text-sm text-slate2">Application forms & drafts — PDF or Word files for operators to download and use.</p>
        </div>
        <Link to={`/admin/categories?tab=${section.scope}`} className="link text-sm text-navy-700">ವರ್ಗಗಳನ್ನು ನಿರ್ವಹಿಸಿ · Manage categories</Link>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap" role="tablist">
        {SECTIONS.map((t) => (
          <button key={t.kind} type="button" role="tab" aria-selected={section.kind === t.kind} className="chip justify-center"
            onClick={() => { setParams({ tab: t.kind }); setErr(null); setMeta(EMPTY); }}>
            {t.kn}<span className="hidden sm:inline"> · {t.en}</span>
            <span className="rounded-full bg-white/80 px-1.5 text-xs text-navy-800">{all?.filter((d) => (d.kind ?? 'APPLICATION') === t.kind).length ?? 0}</span>
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-6 grid gap-3 rounded-xl2 border border-line bg-white p-5 sm:grid-cols-2">
        <FormField id="file" label="ಫೈಲ್" helper="PDF, Word (.doc / .docx), JPG or PNG" required>
          <input id="file" ref={fileRef} type="file" accept={ACCEPT}
            onChange={(e) => { const f = e.target.files?.[0]; if (f && !meta.title) setMeta((m) => ({ ...m, title: f.name.replace(/\.[^.]+$/, '') })); }}
            className="block w-full rounded-lg border border-[#c3cfe2] bg-white text-sm file:mr-3 file:rounded-l-lg file:border-0 file:bg-navy-50 file:px-3 file:py-2.5 file:font-semibold file:text-navy-800 hover:file:bg-navy-100" />
        </FormField>
        <FormField id="title" label="ಶೀರ್ಷಿಕೆ" helper="Title (filled from the file name)" required>
          <Input id="title" value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} required />
        </FormField>
        <FormField id="cat" label="ವರ್ಗ / ಉಪ-ವರ್ಗ" helper="Category or sub-category">
          <CategorySelect id="cat" categories={cats.data} value={meta.categoryId} onChange={(v) => setMeta({ ...meta, categoryId: v })} />
        </FormField>
        <FormField id="vis" label="ಯಾರು ಡೌನ್‌ಲೋಡ್ ಮಾಡಬಹುದು" helper="Who can download">
          <Select id="vis" value={meta.visibility} onChange={(e) => setMeta({ ...meta, visibility: e.target.value as 'PUBLIC' | 'PRIVATE' })}>
            <option value="PRIVATE">{VIS.PRIVATE}</option>
            <option value="PUBLIC">{VIS.PUBLIC}</option>
          </Select>
        </FormField>
        <div className="sm:col-span-2">
          <FormField id="img" label="ಪ್ರದರ್ಶನ ಚಿತ್ರ" helper="Display image (optional) — e.g. a photo of the filled form. Phone photos are resized automatically.">
            <input id="img" ref={imgRef} type="file" accept="image/png,image/jpeg,image/webp"
              className="block w-full rounded-lg border border-[#c3cfe2] bg-white text-sm file:mr-3 file:rounded-l-lg file:border-0 file:bg-navy-50 file:px-3 file:py-2.5 file:font-semibold file:text-navy-800 hover:file:bg-navy-100" />
          </FormField>
        </div>
        <div className="sm:col-span-2">
          <FormField id="desc" label="ವಿವರ" helper="Optional — e.g. “Fill in Kannada, sign and attach Aadhaar copy”">
            <Input id="desc" value={meta.description} onChange={(e) => setMeta({ ...meta, description: e.target.value })} />
          </FormField>
        </div>
        {err && <div className="sm:col-span-2"><Alert tone="error">{err}</Alert></div>}
        <div className="sm:col-span-2"><Button type="submit" loading={upload.isPending || setImage.isPending}>ಅಪ್‌ಲೋಡ್ · Upload to {section.en}</Button></div>
      </form>

      <div className="mt-6">
        {isLoading ? <div className="grid place-items-center py-16"><Spinner className="h-7 w-7 text-navy-500" /></div> : !data?.length ? (
          <div className="info-panel text-center text-slate2">ಇಲ್ಲಿ ಇನ್ನೂ ಏನೂ ಇಲ್ಲ · Nothing in this section yet.</div>
        ) : (
          <Table>
            <thead><tr><Th>ಶೀರ್ಷಿಕೆ · Title</Th><Th>ವರ್ಗ · Category</Th><Th>ವಿಧ</Th><Th>ಯಾರಿಗೆ</Th><Th><span className="sr-only">Actions</span></Th></tr></thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.id}>
                  <Td className="text-navy-900">
                    <span className="flex items-center gap-3">
                      {d.imageUrl
                        ? <img src={d.imageUrl} alt="" className="h-12 w-10 shrink-0 rounded border border-line bg-white object-cover" />
                        : <span className="h-12 w-10 shrink-0 rounded border border-dashed border-line" aria-hidden />}
                      <span>{d.title}{d.description && <span className="block text-xs text-slate2">{d.description}</span>}</span>
                    </span>
                  </Td>
                  <Td className="whitespace-nowrap">{categoryPath(cats.data, d.categoryId)}</Td>
                  <Td>{TYPE[d.fileExt ?? ''] ?? d.fileExt}</Td>
                  <Td className="whitespace-nowrap text-xs">{d.visibility === 'PRIVATE' ? '🔒 Operators' : 'Everyone'}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" onClick={() => { setEdit(d); setEditErr(null); }}>ಸಂಪಾದಿಸಿ · Edit</Button>
                      <Button size="sm" variant="ghost" onClick={() => { if (window.confirm('ಆರ್ಕೈವ್ ಮಾಡಬೇಕೆ? · Remove this template?')) archive.mutate(d.id); }}>ಆರ್ಕೈವ್</Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      <Modal open={!!edit} onClose={() => setEdit(null)} title="ಟೆಂಪ್ಲೇಟ್ ಸಂಪಾದನೆ · Edit template">
        {edit && (
          <form key={edit.id} className="space-y-3" onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            try {
              await update.mutateAsync({ id: edit.id, body: {
                title: String(fd.get('title') || ''), description: String(fd.get('description') || '') || null,
                categoryId: String(fd.get('categoryId') || '') || null, visibility: String(fd.get('visibility')),
                kind: String(fd.get('kind') || section.kind),
              } });
              setEdit(null);
            } catch (e2) { setEditErr(errText(e2)); }
          }}>
            {editErr && <Alert tone="error">{editErr}</Alert>}
            <FormField id="ed-t" label="ಶೀರ್ಷಿಕೆ" helper="Title" required><Input id="ed-t" name="title" defaultValue={edit.title} required /></FormField>
            <FormField id="ed-d" label="ವಿವರ" helper="Description"><Input id="ed-d" name="description" defaultValue={edit.description ?? ''} /></FormField>
            <FormField id="ed-c" label="ವರ್ಗ / ಉಪ-ವರ್ಗ" helper="Category">
              <CategorySelect id="ed-c" name="categoryId" categories={cats.data} defaultValue={edit.categoryId ?? ''} />
            </FormField>
            <FormField id="ed-k" label="ವಿಭಾಗ" helper="Section (moving to the other section clears the category)">
              <Select id="ed-k" name="kind" defaultValue={edit.kind ?? 'APPLICATION'}>
                {SECTIONS.map((t) => <option key={t.kind} value={t.kind}>{t.kn} · {t.en}</option>)}
              </Select>
            </FormField>
            <div className="rounded-lg border border-line p-3">
              <p className="text-sm font-medium text-navy-900">ಪ್ರದರ್ಶನ ಚಿತ್ರ <span className="text-xs font-normal text-slate2">· Display image</span></p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {edit.imageUrl
                  ? <img src={edit.imageUrl} alt="" className="h-20 w-16 rounded border border-line bg-white object-cover" />
                  : <span className="grid h-20 w-16 place-items-center rounded border border-dashed border-line text-xs text-slate2">ಇಲ್ಲ</span>}
                <label className={buttonClass('secondary', 'sm')}>
                  {edit.imageUrl ? 'ಬದಲಿಸಿ · Replace' : 'ಅಪ್‌ಲೋಡ್ · Upload'}
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={async (e) => {
                    const f = e.target.files?.[0]; if (!f) return;
                    try { const r = await setImage.mutateAsync({ id: edit.id, file: await shrinkImage(f, 800) }); setEdit(r.document); setEditErr(null); }
                    catch (e2) { setEditErr(errText(e2)); }
                    finally { e.target.value = ''; }
                  }} />
                </label>
                {edit.imageUrl && (
                  <Button type="button" size="sm" variant="ghost" loading={removeImage.isPending}
                    onClick={async () => { const r = await removeImage.mutateAsync(edit.id); setEdit(r.document); }}>ತೆಗೆದುಹಾಕಿ · Remove</Button>
                )}
              </div>
            </div>
            <FormField id="ed-v" label="ಯಾರು ಡೌನ್‌ಲೋಡ್ ಮಾಡಬಹುದು" helper="Who can download">
              <Select id="ed-v" name="visibility" defaultValue={edit.visibility}>
                <option value="PRIVATE">{VIS.PRIVATE}</option><option value="PUBLIC">{VIS.PUBLIC}</option>
              </Select>
            </FormField>
            <div className="flex gap-2">
              <Button type="submit" loading={update.isPending}>ಉಳಿಸಿ · Save</Button>
              <Button type="button" variant="secondary" onClick={() => setEdit(null)}>ರದ್ದು · Cancel</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
