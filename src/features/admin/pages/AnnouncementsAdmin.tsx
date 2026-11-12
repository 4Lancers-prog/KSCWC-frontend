// AnnouncementsAdmin.tsx — create/publish/archive announcements and videos.
import { useState } from 'react';
import { Button, Input, Select, Table, Th, Td, Pagination, Spinner, Alert, FormField, Modal } from '@/components/ui';
import { StatusBadge } from '@/components/layout/StatusBadge';
import { useAdminAnnouncements, useAnnouncementMutations } from '../admin.api';
import type { PublicAnnouncement } from '@/types/entities';

export function AnnouncementsAdmin() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminAnnouncements(page);
  const { create, update, archive } = useAnnouncementMutations();
  const [form, setForm] = useState({ title: '', contentType: 'ANNOUNCEMENT', body: '', videoUrl: '', status: 'PUBLISHED' });
  const [err, setErr] = useState<string | null>(null);
  const [edit, setEdit] = useState<PublicAnnouncement | null>(null);
  const [editErr, setEditErr] = useState<string | null>(null);

  const saveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEditErr(null);
    const fd = new FormData(e.currentTarget);
    const contentType = String(fd.get('contentType'));
    try {
      await update.mutateAsync({
        id: edit!.id,
        body: {
          title: String(fd.get('title')),
          contentType,
          body: String(fd.get('body') || ''),
          videoUrl: contentType === 'VIDEO' ? String(fd.get('videoUrl') || '') : undefined,
          status: String(fd.get('status')),
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
      await create.mutateAsync({
        title: form.title,
        contentType: form.contentType,
        body: form.body || undefined,
        videoUrl: form.contentType === 'VIDEO' ? form.videoUrl : undefined,
        status: form.status,
      });
      setForm({ title: '', contentType: 'ANNOUNCEMENT', body: '', videoUrl: '', status: 'PUBLISHED' });
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'Could not save');
    }
  };

  return (
    <div>
      <div className="gold-rule mb-3" />
      <h1 className="font-display text-2xl text-navy-900">ಪ್ರಕಟಣೆಗಳು / ವೀಡಿಯೊ</h1>

      <form onSubmit={submit} className="mt-6 grid gap-3 rounded-xl2 border border-line bg-white p-5 sm:grid-cols-2">
        {err && <div className="sm:col-span-2"><Alert tone="error">{err}</Alert></div>}
        <FormField id="title" label="ಶೀರ್ಷಿಕೆ" helper="Title" required>
          <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </FormField>
        <FormField id="type" label="ಬಗೆ" helper="Type">
          <Select id="type" value={form.contentType} onChange={(e) => setForm({ ...form, contentType: e.target.value })}>
            <option value="ANNOUNCEMENT">ಪ್ರಕಟಣೆ</option>
            <option value="VIDEO">ವೀಡಿಯೊ (YouTube)</option>
          </Select>
        </FormField>
        {form.contentType === 'VIDEO' ? (
          <FormField id="videoUrl" label="YouTube URL" helper="youtube.com or youtu.be">
            <Input id="videoUrl" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />
          </FormField>
        ) : (
          <FormField id="body" label="ವಿವರ" helper="Body">
            <Input id="body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          </FormField>
        )}
        <FormField id="status" label="ಸ್ಥಿತಿ" helper="Status">
          <Select id="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="DRAFT">ಡ್ರಾಫ್ಟ್</option>
            <option value="PUBLISHED">ಪ್ರಕಟಿಸಿ</option>
          </Select>
        </FormField>
        <div className="sm:col-span-2"><Button type="submit" loading={create.isPending}>ಸೇರಿಸಿ · Add</Button></div>
      </form>

      <div className="mt-6">
        {isLoading ? <div className="grid place-items-center py-16"><Spinner className="h-7 w-7 text-navy-500" /></div> : !data || data.total === 0 ? (
          <div className="rounded-xl2 border border-dashed border-line bg-white p-10 text-center text-slate2">—</div>
        ) : (
          <>
            <Table>
              <thead><tr><Th>ಶೀರ್ಷಿಕೆ</Th><Th>ಬಗೆ</Th><Th>ಸ್ಥಿತಿ</Th><Th> </Th></tr></thead>
              <tbody>
                {data.items.map((a) => (
                  <tr key={a.id}>
                    <Td className="text-navy-900">{a.title}</Td>
                    <Td>{a.contentType}</Td>
                    <Td><StatusBadge label={a.status ?? '—'} tone={a.status === 'PUBLISHED' ? 'success' : a.status === 'ARCHIVED' ? 'neutral' : 'warning'} /></Td>
                    <Td>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="secondary" onClick={() => { setEdit(a); setEditErr(null); }}>ಸಂಪಾದಿಸಿ</Button>
                        {a.status !== 'ARCHIVED' && <Button size="sm" variant="ghost" onClick={() => archive.mutate(a.id)}>ಆರ್ಕೈವ್</Button>}
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onChange={setPage} />
          </>
        )}
      </div>

      <Modal open={!!edit} onClose={() => setEdit(null)} title="ಪ್ರಕಟಣೆ ಸಂಪಾದನೆ">
        {edit && (
          <form onSubmit={saveEdit} className="space-y-3" key={edit.id}>
            {editErr && <Alert tone="error">{editErr}</Alert>}
            <FormField id="e-title" label="ಶೀರ್ಷಿಕೆ" helper="Title" required>
              <Input id="e-title" name="title" defaultValue={edit.title} required />
            </FormField>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField id="e-type" label="ಬಗೆ" helper="Type">
                <Select id="e-type" name="contentType" defaultValue={edit.contentType}>
                  <option value="ANNOUNCEMENT">ಪ್ರಕಟಣೆ</option>
                  <option value="VIDEO">ವೀಡಿಯೊ (YouTube)</option>
                </Select>
              </FormField>
              <FormField id="e-status" label="ಸ್ಥಿತಿ" helper="Status">
                <Select id="e-status" name="status" defaultValue={edit.status}>
                  <option value="DRAFT">ಡ್ರಾಫ್ಟ್</option>
                  <option value="PUBLISHED">ಪ್ರಕಟಿತ</option>
                  <option value="ARCHIVED">ಆರ್ಕೈವ್</option>
                </Select>
              </FormField>
            </div>
            <FormField id="e-video" label="YouTube URL" helper="Only for video items">
              <Input id="e-video" name="videoUrl" defaultValue={edit.videoUrl ?? ''} />
            </FormField>
            <FormField id="e-body" label="ವಿವರ" helper="Body">
              <Input id="e-body" name="body" defaultValue={edit.body ?? ''} />
            </FormField>
            <FormField id="e-sort" label="ಕ್ರಮ" helper="Sort order">
              <Input id="e-sort" name="sortOrder" type="number" defaultValue={String(edit.sortOrder ?? 0)} />
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
