// PendingApprovalPage.tsx — shown after registration (account awaiting admin approval).
// The registration is already in the admin's "User approvals" queue; once approved the operator
// simply signs in. If rejected, the login screen shows the admin's reason.
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
        <Link to="/" className="font-medium text-navy-600 hover:underline">
          ← ಮುಖಪುಟ · Home
        </Link>
      }
    >
      <Alert tone="info" title="ಪರಿಶೀಲನೆ">
        {L.pending_body}
      </Alert>
      <p className="mt-4 text-sm text-slate2">{H.pending_body}</p>
      <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-slate2">
        <li>ನಿಮ್ಮ ನೋಂದಣಿ ನಿರ್ವಾಹಕರ ಅನುಮೋದನೆ ಪಟ್ಟಿಗೆ ಕಳುಹಿಸಲಾಗಿದೆ · Your request is in the admin approval queue.</li>
        <li>ಅನುಮೋದನೆಯ ನಂತರ ಅದೇ ಮೊಬೈಲ್ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್‌ನಿಂದ ಪ್ರವೇಶಿಸಿ · Once approved, sign in with the same mobile and password.</li>
        <li>ತಿರಸ್ಕರಿಸಿದರೆ, ಕಾರಣ ಪ್ರವೇಶ ಪುಟದಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ · If it is rejected, the reason is shown when you try to sign in.</li>
      </ol>
      <Link
        to="/login"
        className="mt-6 flex h-11 w-full items-center justify-center rounded-lg bg-navy-600 text-[15px] font-medium text-white hover:bg-navy-700"
      >
        ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ / ಪ್ರವೇಶಿಸಿ · Check status & sign in
      </Link>
    </AuthShell>
  );
}
