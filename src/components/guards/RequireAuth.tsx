// RequireAuth.tsx — client gate: redirect to /login when not authenticated (server also enforces).
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui';

export function RequireAuth() {
  const { isAuthenticated, isLoading, mfaSetupRequired } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner className="h-8 w-8 text-navy-500" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  // An admin whose MFA enrolment is pending can't use any API yet — send them to finish it.
  if (mfaSetupRequired) return <Navigate to="/admin/mfa-setup" replace />;
  return <Outlet />;
}
