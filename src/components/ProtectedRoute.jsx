import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { loginPath } from '@/lib/auth-session';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

export default function ProtectedRoute({ unauthenticatedElement }) {
  const { isAuthenticated, isLoadingAuth, authChecked, authError } = useAuth();
  const location = useLocation();
  if (isLoadingAuth || !authChecked) return <div role="status" aria-label="Checking sign in" />;
  if (authError?.type === 'user_not_registered') return <UserNotRegisteredError />;
  if (!isAuthenticated || authError) return unauthenticatedElement || <Navigate to={loginPath(location)} replace />;
  return <Outlet />;
}
