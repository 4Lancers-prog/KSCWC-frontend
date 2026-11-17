// TemplatesPage.tsx — operator: all templates (incl. members-only), grouped by category.
import { Spinner, Alert } from '@/components/ui';
import { usePublicDocuments } from '@/features/public-content/public-content.api';
import { DocumentSections } from '@/features/public-content/components/TemplateList';

export function TemplatesPage() {
  const docs = usePublicDocuments();
  return (
    <div>
      <div className="gold-rule mb-4" />
      <h1 className="font-display text-2xl text-navy-900">ಅರ್ಜಿ ನಮೂನೆಗಳು ಮತ್ತು ಕರಡುಗಳು</h1>
      <p className="mt-1 text-slate2">Application forms & drafts · ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ, ತುಂಬಿಸಿ, ಮುದ್ರಿಸಿ · download, fill in, print</p>
      <div className="mt-6">
        {docs.isLoading ? <div className="grid place-items-center py-16"><Spinner className="h-7 w-7 text-navy-500" /></div>
          : docs.isError ? <Alert tone="error">ಲೋಡ್ ಆಗಲಿಲ್ಲ · Could not load templates.</Alert>
          : !docs.data?.length ? <div className="info-panel text-center text-slate2">ಇನ್ನೂ ಏನೂ ಇಲ್ಲ · Nothing yet.</div>
          : <DocumentSections docs={docs.data} />}
      </div>
    </div>
  );
}
