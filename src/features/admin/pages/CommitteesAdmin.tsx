// CommitteesAdmin.tsx — add/archive founders, trustees, state and district committee members.
import { useState } from 'react';
import { Button, Input, Select, Table, Th, Td, Spinner, Alert, FormField, Modal } from '@/components/ui';
import { useAdminCommittees, useCommitteeMutations } from '../admin.api';
import type { CommitteeMember } from '@/types/entities';

export function CommitteesAdmin() {
  const { data, isLoading } = useAdminCommittees();
  const { create, update, archive } = useCommitteeMutations();
  const [form, setForm] = useState({ committeeType: 'STATE', name: '', roleTitle: '', district: '', publicPhone: '' });
  const [err, setErr] = useState<string | null>(null);
  const [edit, setEdit] = useState<CommitteeMember | null>(null);
  const [editErr, setEditErr] = useState<string | null>(null);

  const saveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEditErr(null);
    const fd = new FormData(e.currentTarget);
    try {
      await update.mutateAsync({
        id: edit!.id,
        body: {
          committeeType: String(fd.get('committeeType')),
          name: String(fd.get('name')),
          roleTitle: String(fd.get('roleTitle') || ''),
          district: String(fd.get('district') || ''),
          bio: String(fd.get('bio') || ''),
          publicPhone: String(fd.get('publicPhone') || ''),
          sortOrder: Number(fd.get('sortOrder') || 0),
          isActive: fd.get('isActive') === 'on',
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
        committeeType: form.committeeType, name: form.name,
        roleTitle: form.roleTitle || undefined, district: form.district || undefined, publicPhone: form.publicPhone || undefined,
      });
      setForm({ committeeType: form.committeeType, name: '', roleTitle: '', district: '', publicPhone: '' });
    } catch (e2) { setErr(e2 instanceof Error ? e2.message : 'Could not save'); }
  };

  return (
    <div>
      <div className="gold-rule mb-3" />
      <h1 className="font-display text-2xl text-navy-900">ನಾಯಕತ್ವ / ಸಮಿತಿಗಳು</h1>

      <form onSubmit={submit} className="mt-6 grid gap-3 rounded-xl2 border border-line bg-white p-5 sm:grid-cols-2">
        {err && <div className="sm:col-span-2"><Alert tone="error">{err}</Alert></div>}
        <FormField id="ctype" label="ವಿಧ" helper="Type">
          <Select id="ctype" value={form.committeeType} onChange={(e) => setForm({ ...form, committeeType: e.target.value })}>
            <option value="FOUNDER">ಸಂಸ್ಥಾಪಕ</option>
            <option value="TRUSTEE">ಟ್ರಸ್ಟಿ</option>
            <option value="STATE">ರಾಜ್ಯ</option>
            <option value="DISTRICT">ಜಿಲ್ಲಾ</option>
          </Select>
        </FormField>
        <FormField id="name" label="ಹೆಸರು" helper="Name" required>
          <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </FormField>
        <FormField id="role" label="ಪದನಾಮ" helper="Role title">
          <Input id="role" value={form.roleTitle} onChange={(e) => setForm({ ...form, roleTitle: e.target.value })} />
        </FormField>
        <FormField id="district" label="ಜಿಲ್ಲೆ" helper="District (for district committee)">
          <Input id="district" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
        </FormField>
        <FormField id="phone" label="ಸಾರ್ವಜನಿಕ ದೂರವಾಣಿ" helper="Public phone (optional)">
          <Input id="phone" value={form.publicPhone} onChange={(e) => setForm({ ...form, publicPhone: e.target.value })} />
        </FormField>
        <div className="sm:col-span-2"><Button type="submit" loading={create.isPending}>ಸೇರಿಸಿ · Add</Button></div>
      </form>

      <div className="mt-6">
        {isLoading ? <div className="grid place-items-center py-16"><Spinner className="h-7 w-7 text-navy-500" /></div> : !data || data.length === 0 ? (
          <div className="rounded-xl2 border border-dashed border-line bg-white p-10 text-center text-slate2">—</div>
        ) : (
          <Table>
            <thead><tr><Th>ಹೆಸರು</Th><Th>ವಿಧ</Th><Th>ಜಿಲ್ಲೆ</Th><Th>ಸ್ಥಿತಿ</Th><Th> </Th></tr></thead>
            <tbody>
              {data.map((m) => (
                <tr key={m.id}>
                  <Td className="text-navy-900">{m.name}<div className="text-xs text-slate2">{m.roleTitle}</div></Td>
                  <Td>{m.committeeType}</Td>
                  <Td>{m.district ?? '—'}</Td>
                  <Td>{m.isActive ? 'ಸಕ್ರಿಯ' : 'ಆರ್ಕೈವ್'}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" onClick={() => { setEdit(m); setEditErr(null); }}>ಸಂಪಾದಿಸಿ</Button>
                      {m.isActive && <Button size="sm" variant="ghost" onClick={() => archive.mutate(m.id)}>ಆರ್ಕೈವ್</Button>}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      <Modal open={!!edit} onClose={() => setEdit(null)} title="ಸಮಿತಿ ಸದಸ್ಯ ಸಂಪಾದನೆ">
        {edit && (
          <form onSubmit={saveEdit} className="space-y-3" key={edit.id}>
            {editErr && <Alert tone="error">{editErr}</Alert>}
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField id="ec-type" label="ವಿಧ" helper="Type">
                <Select id="ec-type" name="committeeType" defaultValue={edit.committeeType}>
                  <option value="FOUNDER">ಸಂಸ್ಥಾಪಕ</option>
                  <option value="TRUSTEE">ಟ್ರಸ್ಟಿ</option>
                  <option value="STATE">ರಾಜ್ಯ</option>
                  <option value="DISTRICT">ಜಿಲ್ಲಾ</option>
                </Select>
              </FormField>
              <FormField id="ec-name" label="ಹೆಸರು" helper="Name" required>
                <Input id="ec-name" name="name" defaultValue={edit.name} required />
              </FormField>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField id="ec-role" label="ಪದನಾಮ" helper="Role title">
                <Input id="ec-role" name="roleTitle" defaultValue={edit.roleTitle ?? ''} />
              </FormField>
              <FormField id="ec-dist" label="ಜಿಲ್ಲೆ" helper="District">
                <Input id="ec-dist" name="district" defaultValue={edit.district ?? ''} />
              </FormField>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField id="ec-phone" label="ದೂರವಾಣಿ" helper="Public phone">
                <Input id="ec-phone" name="publicPhone" defaultValue={edit.publicPhone ?? ''} />
              </FormField>
              <FormField id="ec-sort" label="ಕ್ರಮ" helper="Sort order">
                <Input id="ec-sort" name="sortOrder" type="number" defaultValue={String(edit.sortOrder ?? 0)} />
              </FormField>
            </div>
            <FormField id="ec-bio" label="ಪರಿಚಯ" helper="Bio">
              <Input id="ec-bio" name="bio" defaultValue={edit.bio ?? ''} />
            </FormField>
            <label className="flex items-center gap-2 text-sm text-navy-900">
              <input type="checkbox" name="isActive" defaultChecked={edit.isActive ?? true} /> ಸಕ್ರಿಯ · Active
            </label>
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
