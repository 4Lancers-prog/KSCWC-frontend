// ServiceCatalogue.tsx — manage the service catalogue (create, edit, deactivate).
import { useState } from 'react';
import { Button, Input, Table, Th, Td, Pagination, Spinner, Alert, FormField, Modal } from '@/components/ui';
import { StatusBadge } from '@/components/layout/StatusBadge';
import { useAdminServices, useServiceMutations } from '../admin.api';
import { rupeesToPaise } from '@/lib/money';
import { formatPaise } from '@/lib/format';
import type { Service } from '@/types/entities';

export function ServiceCatalogue() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminServices(page);
  const { create, update, deactivate } = useServiceMutations();
  const [form, setForm] = useState({ code: '', nameKn: '', nameEn: '', feeRupees: '', sortOrder: '0' });
  const [err, setErr] = useState<string | null>(null);
  const [edit, setEdit] = useState<Service | null>(null);
  const [editErr, setEditErr] = useState<string | null>(null);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      await create.mutateAsync({
        code: form.code.trim().toUpperCase().replace(/\s+/g, '_'),
        nameKn: form.nameKn,
        nameEn: form.nameEn || undefined,
        defaultFeePaise: form.feeRupees ? rupeesToPaise(Number(form.feeRupees)) : undefined,
        sortOrder: Number(form.sortOrder || 0),
        isActive: true,
      });
      setForm({ code: '', nameKn: '', nameEn: '', feeRupees: '', sortOrder: '0' });
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'Could not save');
    }
  };

  const saveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEditErr(null);
    const fd = new FormData(e.currentTarget);
    const fee = String(fd.get('feeRupees') || '');
    try {
      await update.mutateAsync({
        id: edit!.id,
        body: {
          nameKn: String(fd.get('nameKn')),
          nameEn: String(fd.get('nameEn') || ''),
          defaultFeePaise: fee ? rupeesToPaise(Number(fee)) : undefined,
          sortOrder: Number(fd.get('sortOrder') || 0),
          isActive: fd.get('isActive') === 'on',
        },
      });
      setEdit(null);
    } catch (e2) {
      setEditErr(e2 instanceof Error ? e2.message : 'Could not save');
    }
  };

  return (
    <div>
      <div className="gold-rule mb-3" />
      <h1 className="font-display text-2xl text-navy-900">ಸೇವಾ ಪಟ್ಟಿ</h1>
      <p className="text-sm text-slate2">Service catalogue</p>

      <form onSubmit={add} className="mt-6 grid gap-3 rounded-xl2 border border-line bg-white p-5 sm:grid-cols-2">
        {err && <div className="sm:col-span-2"><Alert tone="error">{err}</Alert></div>}
        <FormField id="s-code" label="ಕೋಡ್" helper="CODE (UPPER_SNAKE)" required>
          <Input id="s-code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
        </FormField>
        <FormField id="s-kn" label="ಹೆಸರು (ಕನ್ನಡ)" helper="Name (Kannada)" required>
          <Input id="s-kn" value={form.nameKn} onChange={(e) => setForm({ ...form, nameKn: e.target.value })} required />
        </FormField>
        <FormField id="s-en" label="ಹೆಸರು (English)" helper="Name (English)">
          <Input id="s-en" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} />
        </FormField>
        <FormField id="s-fee" label="ಡೀಫಾಲ್ಟ್ ಶುಲ್ಕ (₹)" helper="Default fee (optional)">
          <Input id="s-fee" inputMode="decimal" value={form.feeRupees} onChange={(e) => setForm({ ...form, feeRupees: e.target.value })} />
        </FormField>
        <div className="sm:col-span-2"><Button type="submit" loading={create.isPending}>ಸೇರಿಸಿ · Add service</Button></div>
      </form>

      <div className="mt-6">
        {isLoading ? <div className="grid place-items-center py-16"><Spinner className="h-7 w-7 text-navy-500" /></div> : !data || data.total === 0 ? (
          <div className="rounded-xl2 border border-dashed border-line bg-white p-10 text-center text-slate2">—</div>
        ) : (
          <>
            <Table>
              <thead><tr><Th>ಕೋಡ್</Th><Th>ಹೆಸರು</Th><Th>ಶುಲ್ಕ</Th><Th>ಸ್ಥಿತಿ</Th><Th> </Th></tr></thead>
              <tbody>
                {data.items.map((s) => (
                  <tr key={s.id}>
                    <Td className="font-mono text-xs text-slate2">{s.code}</Td>
                    <Td className="text-navy-900">{s.nameKn}<div className="text-xs text-slate2">{s.nameEn}</div></Td>
                    <Td>{s.defaultFeePaise != null ? formatPaise(s.defaultFeePaise) : '—'}</Td>
                    <Td><StatusBadge label={s.isActive ? 'ಸಕ್ರಿಯ' : 'ನಿಷ್ಕ್ರಿಯ'} tone={s.isActive ? 'success' : 'neutral'} /></Td>
                    <Td>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="secondary" onClick={() => { setEdit(s); setEditErr(null); }}>ಸಂಪಾದಿಸಿ</Button>
                        {s.isActive && <Button size="sm" variant="ghost" onClick={() => deactivate.mutate(s.id)}>ನಿಷ್ಕ್ರಿಯ</Button>}
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

      <Modal open={!!edit} onClose={() => setEdit(null)} title="ಸೇವೆ ಸಂಪಾದನೆ">
        {edit && (
          <form onSubmit={saveEdit} className="space-y-3" key={edit.id}>
            {editErr && <Alert tone="error">{editErr}</Alert>}
            <p className="text-xs text-slate2">ಕೋಡ್: <span className="font-mono">{edit.code}</span> (ಬದಲಾಯಿಸಲಾಗದು)</p>
            <FormField id="es-kn" label="ಹೆಸರು (ಕನ್ನಡ)" helper="Name (Kannada)" required>
              <Input id="es-kn" name="nameKn" defaultValue={edit.nameKn} required />
            </FormField>
            <FormField id="es-en" label="ಹೆಸರು (English)" helper="Name (English)">
              <Input id="es-en" name="nameEn" defaultValue={edit.nameEn ?? ''} />
            </FormField>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField id="es-fee" label="ಶುಲ್ಕ (₹)" helper="Default fee">
                <Input id="es-fee" name="feeRupees" inputMode="decimal" defaultValue={edit.defaultFeePaise != null ? String(edit.defaultFeePaise / 100) : ''} />
              </FormField>
              <FormField id="es-sort" label="ಕ್ರಮ" helper="Sort order">
                <Input id="es-sort" name="sortOrder" type="number" defaultValue={String(edit.sortOrder ?? 0)} />
              </FormField>
            </div>
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
