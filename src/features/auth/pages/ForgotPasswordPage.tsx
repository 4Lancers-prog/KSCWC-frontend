// ForgotPasswordPage.tsx — how to get back in when you forget your password.
// There is no SMS/email service, so resets are admin-assisted: the council admin creates a one-time
// link (User approvals → Reset link) and sends it to the operator by WhatsApp/SMS.
import { Link } from 'react-router-dom';
import { AuthShell } from '@/components/layout/AuthShell';
import { Alert } from '@/components/ui';
import { L } from '@/i18n';

export function ForgotPasswordPage() {
  return (
    <AuthShell
      title="ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ?"
      subtitle="Forgot your password?"
      footer={<Link to="/login" className="font-medium text-navy-600 link">← {L.login}</Link>}
    >
      <Alert tone="info" title="ನಿರ್ವಾಹಕರು ನಿಮಗೆ ಲಿಂಕ್ ಕಳುಹಿಸುತ್ತಾರೆ · The admin will send you a link">
        ನಿಮ್ಮ ಜಿಲ್ಲಾ ಸಂಯೋಜಕರು ಅಥವಾ ಪರಿಷತ್ ಕಚೇರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ ಮತ್ತು ನಿಮ್ಮ ನೋಂದಾಯಿತ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ತಿಳಿಸಿ.
      </Alert>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate2">
        <li>Contact your <b>district coordinator</b> or the <b>council office</b> and tell them your registered mobile number.</li>
        <li>They will send you a <b>password reset link</b> on WhatsApp or SMS.</li>
        <li>Open the link within <b>24 hours</b> and choose a new password (at least 12 characters).</li>
      </ol>
      <p className="mt-4 text-sm text-slate2">
        ಸಂಪರ್ಕ ವಿವರಗಳಿಗೆ · For contact details see{' '}
        <Link to="/contact" className="link text-navy-700">ಸಂಪರ್ಕ · Contact</Link>.
      </p>
    </AuthShell>
  );
}
