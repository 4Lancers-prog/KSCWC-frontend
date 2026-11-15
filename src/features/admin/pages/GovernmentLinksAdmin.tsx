// GovernmentLinksAdmin.tsx — add/deactivate government service links (https only).
import { useState } from 'react';
import { Button, Input, Table, Th, Td, Spinner, Alert, FormField, Modal, Select, buttonClass } from '@/components/ui';
import { useAdminLinks, useLinkMutations } from '../admin.api';
import type { GovLink } from '@/types/entities';

type GovCategory = 'STATE' | 'CENTRAL' | 'OTHER';
const CATEGORIES: { v: GovCategory; label: string }[] = [
  { v: 'STATE', label: 'ಕರ್ನಾಟಕ · Karnataka' },
  { v: 'CENTRAL', label: 'ಭಾರತ ಸರ್ಕಾರ · India' },
  { v: 'OTHER', label: 'ಇತರೆ · Other' },
];

export function GovernmentLinksAdmin() {
  const { data, isLoading } = useAdminLinks();
  const { create, update, deactivate, reactivate, setImage, removeImage } = useLinkMutations();
  const [newImage, setNewImage] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0); // resets the file input after adding
  const EMPTY = { title: '', url: '', description: '', category: 'STATE' as GovCategory, featured: true };
  const [form, setForm] = useState(EMPTY);
  const [err, setErr] = useState<string | null>(null);
  const [edit, setEdit] = useState<GovLink | null>(null);
  const [editErr, setEditErr] = useState<string | null>(null);

  const saveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEditErr(null);
    const fd = new FormData(e.currentTarget);
    try {
      await update.mutateAsync({
        id: edit!.id,
        body: {
          title: String(fd.get('title')),
          url: String(fd.get('url')),
          description: String(fd.get('description') || ''),
          sortOrder: Number(fd.get('sortOrder') || 0),
          category: String(fd.get('category') || 'OTHER') as GovCategory,
          featured: fd.get('featured') === 'on',
        },
      });
      setEdit(null);
    } catch (e2) {
      setEditErr(e2 instanceof Error ? e2.message : 'Could not save');
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      const { link } = await create.mutateAsync({
        title: form.title, url: form.url, description: form.description || undefined,
        category: form.category, featured: form.featured,
      });
      if (newImage) await setImage.mutateAsync({ id: link.id, file: newImage });
      setForm(EMPTY);
      setNewImage(null);
      setFileKey((k) => k + 1);
    } catch (e2) { setErr(e2 instanceof Error ? e2.message : 'Could not save'); }
  };

  return (
    <div>
      <div className="gold-rule mb-3" />
      <h1 className="font-display text-2xl text-navy-900">ಸರ್ಕಾರಿ ಕೊಂಡಿಗಳು</h1>
      <form onSubmit={submit} className="mt-6 grid gap-3 rounded-xl2 border border-line bg-white p-5 sm:grid-cols-2">
        {err && <div className="sm:col-span-2"><Alert tone="error">{err}</Alert></div>}
        <FormField id="title" label="ಶೀರ್ಷಿಕೆ" helper="Title" required>
          <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </FormField>
        <FormField id="url" label="URL" helper="https:// only" required>
          <Input id="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required />
        </FormField>
        <FormField id="desc" label="ವಿವರ" helper="Description">
          <Input id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </FormField>
        <FormField id="cat" label="ವರ್ಗ" helper="Category">
          <Select id="cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as GovCategory })}>
            {CATEGORIES.map((c) => <option key={c.v} value={c.v}>{c.label}</option>)}
          </Select>
        </FormField>
        <label className="flex min-h-11 items-center gap-3 self-end rounded-lg border border-line bg-mist px-3 text-sm text-navy-900">
          <input type="checkbox" className="h-5 w-5 accent-navy-600" checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
          ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ ತೋರಿಸಿ · Show on operator dashboard
        </label>
        <FormField id="img" label="ಲೋಗೋ / ಫೋಟೋ" helper="Optional · PNG, JPG or WebP, up to 2 MB">
          <input key={fileKey} id="img" type="file" accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setNewImage(e.target.files?.[0] ?? null)}
            className="block w-full rounded-lg border border-[#c3cfe2] bg-white text-sm file:mr-3 file:rounded-l-lg file:border-0 file:bg-navy-50 file:px-3 file:py-2.5 file:font-semibold file:text-navy-800 hover:file:bg-navy-100" />
        </FormField>
        <div className="sm:col-span-2"><Button type="submit" loading={create.isPending || setImage.isPending}>ಸೇರಿಸಿ · Add</Button></div>
      </form>

      <div className="mt-6">
        {isLoading ? <div className="grid place-items-center py-16"><Spinner className="h-7 w-7 text-navy-500" /></div> : !data || data.length === 0 ? (
          <div className="rounded-xl2 border border-dashed border-line bg-white p-10 text-center text-slate2">—</div>
        ) : (
          <Table>
            <thead><tr><Th>ಶೀರ್ಷಿಕೆ</Th><Th>URL</Th><Th>ವರ್ಗ</Th><Th>ಡ್ಯಾಶ್‌ಬೋರ್ಡ್</Th><Th>ಸ್ಥಿತಿ</Th><Th><span className="sr-only">Actions</span></Th></tr></thead>
            <tbody>
              {data.map((l) => (
                <tr key={l.id}>
                  <Td className="text-navy-900">
                    <span className="flex items-center gap-2">
                      {l.imageUrl
                        ? <img src={l.imageUrl} alt="" className="h-8 w-8 shrink-0 rounded-md border border-line bg-white object-contain" />
                        : <span className="h-8 w-8 shrink-0 rounded-md border border-dashed border-line" aria-hidden />}
                      {l.title}
                    </span>
                  </Td>
                  <Td className="max-w-[260px] truncate">
                    {l.url
                      ? <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-navy-600 link">{l.url}</a>
                      : <button type="button" onClick={() => setEdit(l)} className="font-semibold text-danger link">⚠ ವಿಳಾಸ ಇಲ್ಲ · Address missing — edit to fix</button>}
                  </Td>
                  <Td className="whitespace-nowrap">{CATEGORIES.find((c) => c.v === (l.category ?? 'OTHER'))?.label}</Td>
                  <Td>{l.featured ? '★ ಹೌದು' : '—'}</Td>
                  <Td>{l.isActive ? 'ಸಕ್ರಿಯ' : 'ನಿಷ್ಕ್ರಿಯ'}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" onClick={() => { setEdit(l); setEditErr(null); }}>ಸಂಪಾದಿಸಿ</Button>
                      {l.isActive
                        ? <Button size="sm" variant="ghost" onClick={() => deactivate.mutate(l.id)}>ನಿಷ್ಕ್ರಿಯ</Button>
                        : <Button size="sm" onClick={() => reactivate.mutate(l.id)}>ಮರುಸಕ್ರಿಯ</Button>}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      <Modal open={!!edit} onClose={() => setEdit(null)} title="ಕೊಂಡಿ ಸಂಪಾದನೆ">
        {edit && (
          <form onSubmit={saveEdit} className="space-y-3" key={edit.id}>
            {editErr && <Alert tone="error">{editErr}</Alert>}
            <FormField id="el-title" label="ಶೀರ್ಷಿಕೆ" helper="Title" required>
              <Input id="el-title" name="title" defaultValue={edit.title} required />
            </FormField>
            <FormField id="el-url" label="URL" helper="https:// only" required>
              <Input id="el-url" name="url" defaultValue={edit.url ?? ''} placeholder="https://…gov.in" required />
            </FormField>
            <FormField id="el-desc" label="ವಿವರ" helper="Description">
              <Input id="el-desc" name="description" defaultValue={edit.description ?? ''} />
            </FormField>
            <FormField id="el-sort" label="ಕ್ರಮ" helper="Sort order">
              <Input id="el-sort" name="sortOrder" type="number" defaultValue={String(edit.sortOrder ?? 0)} />
            </FormField>
            <FormField id="el-cat" label="ವರ್ಗ" helper="Category">
              <Select id="el-cat" name="category" defaultValue={edit.category ?? 'OTHER'}>
                {CATEGORIES.map((c) => <option key={c.v} value={c.v}>{c.label}</option>)}
              </Select>
            </FormField>
            <label className="flex min-h-11 items-center gap-3 rounded-lg border border-line bg-mist px-3 text-sm text-navy-900">
              <input type="checkbox" name="featured" className="h-5 w-5 accent-navy-600" defaultChecked={!!edit.featured} />
              ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ ತೋರಿಸಿ · Show on operator dashboard
            </label>
            <div className="rounded-lg border border-line p-3">
              <p className="text-sm font-medium text-navy-900">ಲೋಗೋ / ಫೋಟೋ <span className="text-xs font-normal text-slate2">· PNG, JPG or WebP, up to 2 MB</span></p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {edit.imageUrl
                  ? <img src={edit.imageUrl} alt="" className="h-16 w-16 rounded-lg border border-line bg-white object-contain" />
                  : <span className="grid h-16 w-16 place-items-center rounded-lg border border-dashed border-line text-xs text-slate2">ಇಲ್ಲ</span>}
                <label className={buttonClass('secondary', 'sm')}>
                  {edit.imageUrl ? 'ಬದಲಿಸಿ · Replace' : 'ಅಪ್‌ಲೋಡ್ · Upload'}
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only"
                    onChange={async (e) => {
                      const f = e.target.files?.[0]; if (!f) return;
                      try { const r = await setImage.mutateAsync({ id: edit.id, file: f }); setEdit(r.link); }
                      catch (e2) { setEditErr(e2 instanceof Error ? e2.message : 'Upload failed'); }
                    }} />
                </label>
                {edit.imageUrl && (
                  <Button type="button" size="sm" variant="ghost" loading={removeImage.isPending}
                    onClick={async () => { const r = await removeImage.mutateAsync(edit.id); setEdit(r.link); }}>
                    ತೆಗೆದುಹಾಕಿ · Remove
                  </Button>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" loading={update.isPending}>ಉಳಿಸಿ · Save</Button>
              <Button type="button" variant="secondary" onClick={() => setEdit(null)}>ರದ್ದು</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
