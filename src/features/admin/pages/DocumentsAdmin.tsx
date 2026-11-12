// DocumentsAdmin.tsx — upload (PDF/DOCX/JPG/PNG) and archive documents.
import { useRef, useState } from 'react';
import { Button, Input, Select, Table, Th, Td, Spinner, Alert, FormField } from '@/components/ui';
import { useAdminDocuments, useDocumentMutations } from '../admin.api';

export function DocumentsAdmin() {
  const { data, isLoading } = useAdminDocuments();
  const { upload, archive } = useDocumentMutations();
  const fileRef = useRef<HTMLInputElement>(null);
  const [meta, setMeta] = useState({ title: '', category: '', visibility: 'PUBLIC' });
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const file = fileRef.current?.files?.[0];
    if (!file) return setErr('ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ · Choose a file');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', meta.title);
    if (meta.category) fd.append('category', meta.category);
    fd.append('visibility', meta.visibility);
    try {
      await upload.mutateAsync(fd);
      setMeta({ title: '', category: '', visibility: 'PUBLIC' });
      if (fileRef.current) fileRef.current.value = '';
    } catch (e2) { setErr(e2 instanceof Error ? e2.message : 'Upload failed'); }
  };

  return (
    <div>
      <div className="gold-rule mb-3" />
      <h1 className="font-display text-2xl text-navy-900">ದಾಖಲೆಗಳು</h1>
      <form onSubmit={submit} className="mt-6 grid gap-3 rounded-xl2 border border-line bg-white p-5 sm:grid-cols-2">
        {err && <div className="sm:col-span-2"><Alert tone="error">{err}</Alert></div>}
        <FormField id="title" label="ಶೀರ್ಷಿಕೆ" helper="Title" required>
          <Input id="title" value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} required />
        </FormField>
        <FormField id="cat" label="ವರ್ಗ" helper="Category">
          <Input id="cat" value={meta.category} onChange={(e) => setMeta({ ...meta, category: e.target.value })} />
        </FormField>
        <FormField id="vis" label="ಗೋಚರತೆ" helper="Visibility">
          <Select id="vis" value={meta.visibility} onChange={(e) => setMeta({ ...meta, visibility: e.target.value })}>
            <option value="PUBLIC">ಸಾರ್ವಜನಿಕ · Public</option>
            <option value="PRIVATE">ಖಾಸಗಿ · Private</option>
          </Select>
        </FormField>
        <FormField id="file" label="ಫೈಲ್" helper="PDF / DOCX / JPG / PNG">
          <input id="file" ref={fileRef} type="file" accept=".pdf,.docx,image/png,image/jpeg" className="text-sm" />
        </FormField>
        <div className="sm:col-span-2"><Button type="submit" loading={upload.isPending}>ಅಪ್‌ಲೋಡ್ · Upload</Button></div>
      </form>

      <div className="mt-6">
        {isLoading ? <div className="grid place-items-center py-16"><Spinner className="h-7 w-7 text-navy-500" /></div> : !data || data.length === 0 ? (
          <div className="rounded-xl2 border border-dashed border-line bg-white p-10 text-center text-slate2">—</div>
        ) : (
          <Table>
            <thead><tr><Th>ಶೀರ್ಷಿಕೆ</Th><Th>ವರ್ಗ</Th><Th>ಗೋಚರತೆ</Th><Th> </Th></tr></thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.id}>
                  <Td className="text-navy-900">{d.title}</Td>
                  <Td>{d.category ?? '—'}</Td>
                  <Td>{d.visibility}</Td>
                  <Td><Button size="sm" variant="secondary" onClick={() => archive.mutate(d.id)}>ಆರ್ಕೈವ್</Button></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
}
