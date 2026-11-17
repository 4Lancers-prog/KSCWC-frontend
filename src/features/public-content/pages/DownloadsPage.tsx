// DownloadsPage.tsx — templates & documents (public). Logged-in operators also see members-only ones.
import { Link } from 'react-router-dom';
import { PageIntro } from '@/components/layout/PageIntro';
import { Spinner, Alert, buttonClass } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { usePublicDocuments } from '../public-content.api';
import { DocumentSections } from '../components/TemplateList';

export function DownloadsPage() {
  const { isAuthenticated } = useAuth();
  const docs = usePublicDocuments();
  return (
    <PageIntro title="ಅರ್ಜಿ ನಮೂನೆಗಳು ಮತ್ತು ಕರಡುಗಳು" subtitle="Application forms & drafts (PDF / Word)">
      {!isAuthenticated && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl2 border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-900">🔒 ನೋಂದಾಯಿತ ಸಂಚಾಲಕರಿಗೆ ಇನ್ನಷ್ಟು ಟೆಂಪ್ಲೇಟ್‌ಗಳು · Registered operators see more forms and drafts after logging in.</p>
          <Link to="/login" state={{ from: '/app/templates' }} className={buttonClass('primary', 'sm')}>ಪ್ರವೇಶ · Log in</Link>
        </div>
      )}
      {docs.isLoading ? (
        <div className="grid place-items-center py-16"><Spinner className="h-7 w-7 text-navy-500" /></div>
      ) : docs.isError ? (
        <Alert tone="error">ಲೋಡ್ ಆಗಲಿಲ್ಲ · Could not load templates.</Alert>
      ) : !docs.data?.length ? (
        <div className="info-panel text-center text-slate2">ಇನ್ನೂ ಏನೂ ಇಲ್ಲ · Nothing yet.</div>
      ) : (
        <DocumentSections docs={docs.data} />
      )}
    </PageIntro>
  );
}
