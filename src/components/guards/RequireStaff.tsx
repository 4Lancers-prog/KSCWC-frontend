// RequireStaff.tsx — admin-area gate. Unauthenticated → /admin/login; operators → /app.
// The API independently enforces every permission; this only controls navigation.
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui';

export function RequireStaff() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner className="h-8 w-8 text-navy-500" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  if (user && user.role === 'USER') return <Navigate to="/app" replace />;
  return <Outlet />;
}
