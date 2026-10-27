import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings] = useState({ public_settings: {} });

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    try {
      const response = await fetch('/api/auth/session', { credentials: 'same-origin', cache: 'no-store' });
      if (response.status === 503) {
        setAuthError({ type: 'service_not_configured', message: 'Independent sign-in is not yet configured' });
        setUser(null); setIsAuthenticated(false);
        return;
      }
      if (!response.ok) {
        setAuthError(null); setUser(null); setIsAuthenticated(false);
        return;
      }
      const data = await response.json();
      setUser(data.user || null);
      setIsAuthenticated(Boolean(data.authenticated && data.user));
      setAuthError(null);
    } catch {
      setAuthError({ type: 'service_unavailable', message: 'Unable to check session' });
      setUser(null); setIsAuthenticated(false);
    } finally { setIsLoadingAuth(false); setAuthChecked(true); }
  }, []);

  useEffect(() => { checkUserAuth(); }, [checkUserAuth]);
  const navigateToLogin = () => {
    if (window.location.pathname !== '/login') window.location.assign('/login');
  };
  const logout = async (shouldRedirect = true) => {
    try { await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }); }
    finally {
      setUser(null); setIsAuthenticated(false);
      if (shouldRedirect) window.location.assign('/login');
    }
  };
  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, isLoadingAuth, isLoadingPublicSettings, authError,
      appPublicSettings, authChecked, logout, navigateToLogin,
      checkUserAuth, checkAppState: checkUserAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
