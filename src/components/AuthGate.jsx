import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { AUTH_PATHS, loginPath } from '@/lib/auth-session';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

export default function AuthGate({ children }) {
  const { isLoadingAuth, isLoadingPublicSettings, authError, checkAppState } = useAuth();
  const location = useLocation();
  if (isLoadingAuth || isLoadingPublicSettings) {
    return <div className="fixed inset-0 flex items-center justify-center" role="status" aria-label="Loading app"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>;
  }
  if (authError?.type === 'auth_required') {
    return AUTH_PATHS.includes(location.pathname) ? children : <Navigate to={loginPath(location)} replace />;
  }
  if (authError?.type === 'user_not_registered') return <UserNotRegisteredError />;
  if (authError) {
    return <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center" role="alert"><h1 className="text-xl font-semibold">Unable to load the app</h1><p>{authError.message}</p><button className="rounded border px-4 py-2" onClick={checkAppState}>Try again</button></main>;
  }
  return children;
}
