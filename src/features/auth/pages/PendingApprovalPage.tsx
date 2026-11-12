// PendingApprovalPage.tsx — shown after registration (account awaiting admin approval).
import { Link } from 'react-router-dom';
import { AuthShell } from '@/components/layout/AuthShell';
import { Alert } from '@/components/ui';
import { L, H } from '@/i18n';

export function PendingApprovalPage() {
  return (
    <AuthShell
      title={L.pending_title}
      subtitle={H.pending_title}
      footer={
        <Link to="/login" className="font-medium text-navy-600 hover:underline">
          {L.login}
        </Link>
      }
    >
      <Alert tone="info" title="ಪರಿಶೀಲನೆ">
        {L.pending_body}
      </Alert>
      <p className="mt-4 text-sm text-slate2">{H.pending_body}</p>
    </AuthShell>
  );
}
