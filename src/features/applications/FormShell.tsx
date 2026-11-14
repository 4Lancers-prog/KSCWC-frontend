// FormShell.tsx — shared public-form layout (intro + success state).
import { type ReactNode } from 'react';
import { PageIntro } from '@/components/layout/PageIntro';
import { Link } from 'react-router-dom';
import { Alert } from '@/components/ui';
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
  const { isAuthenticated, user } = useAuth();
  return (
    <PageIntro title={title} subtitle={subtitle}>
      <div className="max-w-xl">
        {success ? (
          <>
            <Alert tone="success" title="ಸ್ವೀಕರಿಸಲಾಗಿದೆ">{success}</Alert>
            {isAuthenticated && user?.role === 'USER' ? (
              <Link to="/app/applications" className="mt-4 inline-block font-medium text-navy-600 link">
                ನನ್ನ ಅರ್ಜಿಗಳ ಸ್ಥಿತಿ ನೋಡಿ → · Track status in My applications
              </Link>
            ) : (
              <p className="mt-4 text-sm text-slate2">
                ನೀವು ನೋಂದಾಯಿತ ಸಂಚಾಲಕರಾಗಿದ್ದರೆ, ಪ್ರವೇಶಿಸಿ “ನನ್ನ ಅರ್ಜಿಗಳು” ನಲ್ಲಿ ಸ್ಥಿತಿ ನೋಡಿ · Registered operators can sign in to track this under “My applications”.
              </p>
            )}
          </>
        ) : children}
      </div>
    </PageIntro>
  );
}
