// DownloadsPage.tsx — public downloadable documents.
import { PageIntro } from '@/components/layout/PageIntro';
import { Spinner, Alert, Table, Th, Td } from '@/components/ui';
import { usePublicDocuments } from '../public-content.api';
import { downloadFile } from '@/lib/download';

function kb(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function DownloadsPage() {
  const { data, isLoading, isError } = usePublicDocuments();
  return (
    <PageIntro title="ಡೌನ್‌ಲೋಡ್‌ಗಳು" subtitle="Downloadable documents">
      {isLoading ? (
        <div className="grid place-items-center py-16"><Spinner className="h-7 w-7 text-navy-500" /></div>
      ) : isError ? (
        <Alert tone="error">ಲೋಡ್ ಆಗಲಿಲ್ಲ · Could not load documents.</Alert>
      ) : !data || data.length === 0 ? (
        <div className="rounded-xl2 border border-dashed border-line bg-mist p-10 text-center text-slate2">—</div>
      ) : (
        <Table>
          <thead><tr><Th>ಶೀರ್ಷಿಕೆ · Title</Th><Th>ವರ್ಗ</Th><Th>ಗಾತ್ರ</Th><Th> </Th></tr></thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.id}>
                <Td className="text-navy-900">{d.title}</Td>
                <Td>{d.category ?? '—'}</Td>
                <Td>{kb(d.sizeBytes)}</Td>
                <Td>
                  <button className="font-medium text-navy-600 link"
                    onClick={() => downloadFile(`/public/documents/${d.id}/download`, d.title)}>
                    ಡೌನ್‌ಲೋಡ್
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </PageIntro>
  );
}
