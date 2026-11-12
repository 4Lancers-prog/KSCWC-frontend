// GovernmentLinksAdmin.tsx — add/deactivate government service links (https only).
import { useState } from 'react';
import { Button, Input, Table, Th, Td, Spinner, Alert, FormField, Modal } from '@/components/ui';
import { useAdminLinks, useLinkMutations } from '../admin.api';
import type { GovLink } from '@/types/entities';

export function GovernmentLinksAdmin() {
  const { data, isLoading } = useAdminLinks();
  const { create, update, deactivate, reactivate } = useLinkMutations();
  const [form, setForm] = useState({ title: '', url: '', description: '' });
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
      await create.mutateAsync({ title: form.title, url: form.url, description: form.description || undefined });
      setForm({ title: '', url: '', description: '' });
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
        <div className="sm:col-span-2"><Button type="submit" loading={create.isPending}>ಸೇರಿಸಿ · Add</Button></div>
      </form>

      <div className="mt-6">
        {isLoading ? <div className="grid place-items-center py-16"><Spinner className="h-7 w-7 text-navy-500" /></div> : !data || data.length === 0 ? (
          <div className="rounded-xl2 border border-dashed border-line bg-white p-10 text-center text-slate2">—</div>
        ) : (
          <Table>
            <thead><tr><Th>ಶೀರ್ಷಿಕೆ</Th><Th>URL</Th><Th>ಸ್ಥಿತಿ</Th><Th> </Th></tr></thead>
            <tbody>
              {data.map((l) => (
                <tr key={l.id}>
                  <Td className="text-navy-900">{l.title}</Td>
                  <Td className="max-w-[260px] truncate"><a href={l.url} target="_blank" rel="noopener noreferrer" className="text-navy-600 hover:underline">{l.url}</a></Td>
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
              <Input id="el-url" name="url" defaultValue={edit.url} required />
            </FormField>
            <FormField id="el-desc" label="ವಿವರ" helper="Description">
              <Input id="el-desc" name="description" defaultValue={edit.description ?? ''} />
            </FormField>
            <FormField id="el-sort" label="ಕ್ರಮ" helper="Sort order">
              <Input id="el-sort" name="sortOrder" type="number" defaultValue={String(edit.sortOrder ?? 0)} />
            </FormField>
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
