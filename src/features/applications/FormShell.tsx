// FormShell.tsx — shared application-form layout (intro, success state, operators-only notice).
// The route is behind RequireAuth; staff accounts are told forms are for operators (API agrees).
import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PageIntro } from '@/components/layout/PageIntro';
import { Alert, buttonClass } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

export function FormShell({
  title,
  subtitle,
  success,
  children,
}: {
  title: string;
  subtitle: string;
  success: ReactNode | null;
  children: ReactNode;
}) {
  const { user } = useAuth();
  const isOperator = user?.role === 'USER';
  return (
    <PageIntro title={title} subtitle={subtitle}>
      <div className="max-w-xl">
        {!isOperator ? (
          <Alert tone="info" title="ಸಂಚಾಲಕರಿಗೆ ಮಾತ್ರ · Operators only">
            ಅರ್ಜಿಗಳನ್ನು ಸಂಚಾಲಕ ಖಾತೆಗಳಿಂದ ಸಲ್ಲಿಸಲಾಗುತ್ತದೆ · Applications are submitted from operator accounts. Staff can
            review them in the admin panel under Applications.
          </Alert>
        ) : success ? (
          <>
            <Alert tone="success" title="ಸ್ವೀಕರಿಸಲಾಗಿದೆ · Received">{success}</Alert>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/app/applications" className={buttonClass('primary')}>
                ಸ್ಥಿತಿ ನೋಡಿ · Track status
              </Link>
              <Link to="/app" className={buttonClass('secondary')}>
                ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ · Dashboard
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="mb-4 text-sm text-slate2">
              {user?.fullName} ಖಾತೆಯಿಂದ ಸಲ್ಲಿಸಲಾಗುತ್ತದೆ · Submitting as <b className="text-navy-900">{user?.fullName}</b>. You can track it
              under “My applications”.
            </p>
            {children}
          </>
        )}
      </div>
    </PageIntro>
  );
}
